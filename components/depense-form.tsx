'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES_DEPENSES, Depense, Culture } from '@/lib/types'
import { TrendingDown } from 'lucide-react'
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

    let error
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

  return (
    <div className={`flex flex-1 flex-col ${fullScreen ? 'bg-background' : ''}`}>
      {fullScreen && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {initialData ? 'Modifier la dépense' : 'Nouvelle dépense'}
            </h2>
            <p className="text-xs text-muted-foreground">Sorties d'argent</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`flex flex-1 flex-col gap-4 ${fullScreen ? 'px-4 pb-28 pt-4' : ''}`}>
        {/* Montant */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Montant *</label>
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

        {/* Catégorie */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Catégorie *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_DEPENSES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategorie(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  categorie === cat
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
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
            <option value="none">— Aucune (dépense générale) —</option>
            {cultures.map(c => (
              <option key={c.id} value={c.id}>
                🌱 {c.nom}{c.variete ? ` (${c.variete})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground block mb-2">Description (optionnel)</label>
          <input
            type="text"
            placeholder="Achat d'engrais NPK..."
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
              disabled={loading || !montant || !categorie}
              className="w-full h-12 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Spinner className="mx-auto h-5 w-5 text-white" />
              ) : (
                initialData ? 'Enregistrer' : 'Ajouter la dépense'
              )}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !montant || !categorie}
            className="h-11 rounded-xl bg-red-500 text-white font-bold shadow-md shadow-red-500/20 disabled:opacity-40 active:scale-[0.98] transition-all text-sm"
          >
            {loading ? <Spinner className="mx-auto h-4 w-4" /> : (initialData ? 'Enregistrer' : 'Ajouter')}
          </button>
        )}
      </form>
    </div>
  )
}
