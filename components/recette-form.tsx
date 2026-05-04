'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Check, Package, Link } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UNITES_VENTE, Recette, Culture } from '@/lib/types'

interface RecetteFormProps {
  onSuccess: () => void
  fullScreen?: boolean
  initialData?: Recette | null
}

export function RecetteForm({ onSuccess, fullScreen = false, initialData }: RecetteFormProps) {
  const [montant, setMontant] = useState('')
  const [description, setDescription] = useState('')
  const [quantite, setQuantite] = useState('')
  const [unite, setUnite] = useState('Sacs')
  const [cultureId, setCultureId] = useState<string>('none')
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('farm_cultures')
    if (stored) setCultures(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (initialData) {
      setMontant(initialData.montant.toString())
      setDescription(initialData.description || '')
      setQuantite(initialData.quantite ? initialData.quantite.toString() : '')
      setUnite(initialData.unite || 'Sacs')
      setCultureId(initialData.culture_id || 'none')
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!montant) return

    setLoading(true)
    const supabase = createClient()

    const data = {
      montant: parseInt(montant),
      description: description || null,
      quantite: quantite ? parseInt(quantite) : null,
      unite: quantite ? unite : null,
      culture_id: cultureId === 'none' ? null : cultureId,
    }

    let error;
    if (initialData) {
      const res = await supabase.from('recettes').update(data).eq('id', initialData.id)
      error = res.error
    } else {
      const res = await supabase.from('recettes').insert(data)
      error = res.error
    }

    if (!error) {
      setMontant('')
      setDescription('')
      setQuantite('')
      setUnite('Sacs')
      setCultureId('none')
      onSuccess()
    }
    setLoading(false)
  }

  const CultureSelect = ({ className }: { className?: string }) => (
    <div className="flex flex-col gap-2">
      <Label className={`flex items-center gap-2 ${fullScreen ? 'text-base font-medium text-foreground' : 'text-sm text-muted-foreground'}`}>
        <Link className="h-4 w-4 text-[#2d4a2d]" />
        Lier à une culture (optionnel)
      </Label>
      <Select value={cultureId} onValueChange={setCultureId}>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Aucune culture liée" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">— Recette générale (non liée) —</span>
          </SelectItem>
          {cultures.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              🌱 {c.nom}{c.variete ? ` (${c.variete})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20">
            <TrendingUp className="h-10 w-10 text-[#2d4a2d]" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {initialData ? 'Modifier la recette' : 'Enregistrez vos ventes et recettes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="montant-recette" className="text-base font-medium text-foreground">
              Montant (FCFA)
            </Label>
            <Input
              id="montant-recette"
              type="number"
              inputMode="numeric"
              placeholder="Ex: 100000"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="h-14 rounded-xl border-border bg-muted/50 text-lg"
              required
            />
          </div>

          <CultureSelect className="h-14 rounded-xl border-border bg-muted/50 text-base" />

          <div className="flex flex-col gap-2">
            <Label className="text-base font-medium text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-[#2d4a2d] dark:text-green-500" />
              Quantité vendue (optionnel)
            </Label>
            <div className="flex gap-3">
              <Input
                id="quantite-recette"
                type="number"
                inputMode="numeric"
                placeholder="Ex: 10"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="h-14 rounded-xl border-border bg-muted/50 text-lg flex-1"
              />
              <Select value={unite} onValueChange={setUnite}>
                <SelectTrigger className="h-14 rounded-xl border-border bg-muted/50 text-base flex-1">
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent>
                  {UNITES_VENTE.map((u) => (
                    <SelectItem key={u} value={u} className="text-base">
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description-recette" className="text-base font-medium text-foreground">
              Description (optionnel)
            </Label>
            <Input
              id="description-recette"
              type="text"
              placeholder="Ex: Vente au marché"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-14 rounded-xl border-border bg-muted/50 text-base"
            />
          </div>

          <div className="mt-auto pt-6">
            <Button
              type="submit"
              disabled={loading || !montant}
              className="h-14 w-full rounded-xl bg-[#2d4a2d] text-base font-semibold text-white hover:bg-[#3d5a3d]"
            >
              {loading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {initialData ? 'Enregistrer les modifications' : 'Enregistrer Recette'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20">
          <TrendingUp className="h-5 w-5 text-[#2d4a2d]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {initialData ? 'Modifier Recette' : 'Ajouter Recette'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="montant-recette-c" className="text-sm text-muted-foreground">Montant (FCFA)</Label>
          <Input
            id="montant-recette-c"
            type="number"
            inputMode="numeric"
            placeholder="Ex: 100000"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="h-12 rounded-xl border-border bg-muted/50"
            required
          />
        </div>

        <CultureSelect className="h-12 rounded-xl border-border bg-muted/50" />

        <div className="flex flex-col gap-2">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" /> Quantité (optionnel)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Qté"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="h-12 rounded-xl border-border bg-muted/50 flex-1"
            />
            <Select value={unite} onValueChange={setUnite}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-muted/50 flex-1">
                <SelectValue placeholder="Unité" />
              </SelectTrigger>
              <SelectContent>
                {UNITES_VENTE.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="desc-recette-c" className="text-sm text-muted-foreground">Description (optionnel)</Label>
          <Input
            id="desc-recette-c"
            type="text"
            placeholder="Ex: Vente au marché"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 rounded-xl border-border bg-muted/50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !montant}
          className="h-12 rounded-xl bg-[#2d4a2d] text-white hover:bg-[#3d5a3d]"
        >
          {loading ? <Spinner className="h-4 w-4" /> : (initialData ? 'Enregistrer' : 'Ajouter')}
        </Button>
      </form>
    </div>
  )
}
