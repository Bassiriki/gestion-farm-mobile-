'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UNITES_VENTE, Recette, Culture } from '@/lib/types'
import { TrendingUp } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

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
    const supabase = createClient()
    supabase.from('cultures').select('*').order('nom').then(({ data }) => {
      if (data) setCultures(data)
    })
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

    let error
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

  return (
    <div className={`flex flex-1 flex-col ${fullScreen ? 'bg-background' : ''}`}>
      {fullScreen && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
            <TrendingUp className="h-5 w-5 text-[#2d4a2d]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {initialData ? 'Modifier la recette' : 'Nouvelle recette'}
            </h2>
            <p className="text-xs text-muted-foreground">Ventes et entrées d'argent</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`flex flex-1 flex-col gap-4 ${fullScreen ? 'px-4 pb-28 pt-4' : ''}`}>
        {/* Montant */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Montant reçu *</label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              required
              className="w-full bg-transparent text-3xl font-black text-foreground placeholder:text-muted-foreground/30 outline-none"
            />
            <span className="text-sm font-semibold text-muted-foreground shrink-0">FCFA</span>
          </div>
        </div>

        {/* Culture liée */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Culture liée</label>
          <select
            value={cultureId}
            onChange={e => setCultureId(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none appearance-none"
          >
            <option value="none">— Aucune (recette générale) —</option>
            {cultures.map(c => (
              <option key={c.id} value={c.id}>
                🌱 {c.nom}{c.variete ? ` (${c.variete})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quantité + Unité */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Quantité vendue (optionnel)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={quantite}
              onChange={e => setQuantite(e.target.value)}
              className="w-20 bg-transparent text-lg font-bold text-foreground placeholder:text-muted-foreground/30 outline-none"
            />
            <div className="flex gap-1.5 flex-wrap flex-1">
              {UNITES_VENTE.map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnite(u)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    unite === u
                      ? 'bg-[#2d4a2d] text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Description (optionnel)</label>
          <input
            type="text"
            placeholder="Vente au marché central..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
        </div>

        {/* Bouton valider */}
        {fullScreen ? (
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-md border-t border-border p-4">
            <button
              type="submit"
              disabled={loading || !montant}
              className="w-full h-12 rounded-xl bg-[#2d4a2d] text-white text-sm font-bold shadow-lg shadow-[#2d4a2d]/20 disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Spinner className="mx-auto h-5 w-5 text-white" />
              ) : (
                initialData ? 'Enregistrer' : 'Ajouter la recette'
              )}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !montant}
            className="h-11 rounded-xl bg-[#2d4a2d] text-white font-bold shadow-md shadow-[#2d4a2d]/20 disabled:opacity-40 active:scale-[0.98] transition-all text-sm"
          >
            {loading ? <Spinner className="mx-auto h-4 w-4" /> : (initialData ? 'Enregistrer' : 'Ajouter')}
          </button>
        )}
      </form>
    </div>
  )
}
