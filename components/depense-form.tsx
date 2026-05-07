'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES_DEPENSES, Depense, Culture } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { TrendingDown, Check, Link } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface DepenseFormProps {
  onSuccess: () => void
  fullScreen?: boolean
  initialData?: Depense | null
}

export function DepenseForm({ onSuccess, fullScreen = false, initialData }: DepenseFormProps) {
  const [montant, setMontant] = useState('')
  const [categorie, setCategorie] = useState('')
  const [description, setDescription] = useState('')
  const [cultureId, setCultureId] = useState<string>('none')
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Charger les cultures depuis Supabase
    const supabase = createClient()
    supabase.from('cultures').select('*').order('nom').then(({ data }) => {
      if (data) setCultures(data)
    })
  }, [])

  useEffect(() => {
    if (initialData) {
      setMontant(initialData.montant.toString())
      setCategorie(initialData.categorie)
      setDescription(initialData.description || '')
      setCultureId(initialData.culture_id || 'none')
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!montant || !categorie) return

    setLoading(true)
    const supabase = createClient()

    const data = {
      montant: parseInt(montant),
      categorie,
      description: description || null,
      culture_id: cultureId === 'none' ? null : cultureId,
    }

    let error;
    if (initialData) {
      const res = await supabase.from('depenses').update(data).eq('id', initialData.id)
      error = res.error
    } else {
      const res = await supabase.from('depenses').insert(data)
      error = res.error
    }

    if (!error) {
      setMontant('')
      setCategorie('')
      setDescription('')
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
            <span className="text-muted-foreground">— Dépense générale (non liée) —</span>
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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <TrendingDown className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {initialData ? 'Modifier la dépense' : 'Enregistrez vos dépenses agricoles'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="montant-depense" className="text-base font-medium text-foreground">
              Montant (FCFA)
            </Label>
            <Input
              id="montant-depense"
              type="number"
              placeholder="Ex: 50000"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="h-14 rounded-xl border-border bg-muted/50 text-lg"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="categorie" className="text-base font-medium text-foreground">
              Catégorie
            </Label>
            <Select value={categorie} onValueChange={setCategorie} required>
              <SelectTrigger id="categorie" className="h-14 rounded-xl border-border bg-muted/50 text-base">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES_DEPENSES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-base">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CultureSelect className="h-14 rounded-xl border-border bg-muted/50 text-base" />

          <div className="flex flex-col gap-2">
            <Label htmlFor="description-depense" className="text-base font-medium text-foreground">
              Description (optionnel)
            </Label>
            <Input
              id="description-depense"
              type="text"
              placeholder="Ex: Achat de graines de maïs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-14 rounded-xl border-border bg-muted/50 text-base"
            />
          </div>

          <div className="mt-auto pt-6">
            <Button 
              type="submit" 
              disabled={loading || !montant || !categorie} 
              className="h-14 w-full rounded-xl bg-red-500 text-base font-semibold text-white hover:bg-red-600"
            >
              {loading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {initialData ? 'Enregistrer les modifications' : 'Enregistrer Dépense'}
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
          <TrendingDown className="h-5 w-5 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {initialData ? 'Modifier Dépense' : 'Ajouter Dépense'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="montant-depense" className="text-sm text-muted-foreground">Montant (FCFA)</Label>
          <Input
            id="montant-depense"
            type="number"
            placeholder="Ex: 50000"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="h-12 rounded-xl border-border bg-muted/50"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categorie" className="text-sm text-muted-foreground">Catégorie</Label>
          <Select value={categorie} onValueChange={setCategorie} required>
            <SelectTrigger id="categorie" className="h-12 rounded-xl border-border bg-muted/50">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES_DEPENSES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CultureSelect className="h-12 rounded-xl border-border bg-muted/50" />

        <div className="flex flex-col gap-2">
          <Label htmlFor="description-depense" className="text-sm text-muted-foreground">Description (optionnel)</Label>
          <Input
            id="description-depense"
            type="text"
            placeholder="Ex: Achat de graines"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 rounded-xl border-border bg-muted/50"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !montant || !categorie} 
          className="h-12 rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          {loading ? <Spinner className="h-4 w-4" /> : (initialData ? 'Enregistrer' : 'Ajouter')}
        </Button>
      </form>
    </div>
  )
}
