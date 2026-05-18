'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UNITES_VENTE, Recette, Culture } from '@/lib/types'
import { TrendingUp, Package, FileText, Wheat, ChevronDown, Ruler } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface RecetteFormProps {
  onSuccess: () => void
  fullScreen?: boolean
  initialData?: Recette | null
}

// ─── Composant champ Flutter-style ───────────────────────────────────────────
function MobileField({
  label,
  icon,
  children,
  required,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="relative flex flex-col">
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 focus-within:border-[#2d4a2d] focus-within:ring-2 focus-within:ring-[#2d4a2d]/10 transition-all">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
          {icon}
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
            {label}{required && <span className="text-[#2d4a2d] ml-0.5">*</span>}
          </span>
          {children}
        </div>
      </div>
    </div>
  )
}

export function RecetteForm({ onSuccess, fullScreen = false, initialData }: RecetteFormProps) {
  const [montant, setMontant] = useState('')
  const [description, setDescription] = useState('')
  const [quantite, setQuantite] = useState('')
  const [unite, setUnite] = useState('Sacs')
  const [cultureId, setCultureId] = useState<string>('none')
  const [cultures, setCultures] = useState<Culture[]>([])
  const [loading, setLoading] = useState(false)
  const [showCultures, setShowCultures] = useState(false)

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

  const selectedCulture = cultures.find(c => c.id === cultureId)

  if (fullScreen) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: '#f5f6fa' }}>
        {/* ── En-tête ── */}
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2d4a2d] shadow-lg shadow-[#2d4a2d]/30">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Modifier la recette' : 'Nouvelle recette'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Ventes et entrées d'argent</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3 px-4 pb-36">

          {/* ── Montant ── */}
          <MobileField label="Montant reçu" icon={<span className="text-base font-bold text-[#2d4a2d]">F</span>} required>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={montant}
                onChange={e => setMontant(e.target.value)}
                required
                className="w-full bg-transparent text-2xl font-bold text-gray-800 placeholder:text-gray-300 outline-none"
              />
              <span className="text-sm font-semibold text-gray-400 shrink-0">FCFA</span>
            </div>
          </MobileField>

          {/* ── Culture liée ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCultures(!showCultures)}
              className="w-full flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 focus:outline-none focus:border-[#2d4a2d] focus:ring-2 focus:ring-[#2d4a2d]/10 transition-all"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                <Wheat className="h-4 w-4 text-[#2d4a2d]" />
              </div>
              <div className="flex flex-1 flex-col items-start min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                  Culture liée
                </span>
                <span className={`text-base font-semibold truncate ${selectedCulture ? 'text-gray-800' : 'text-gray-300'}`}>
                  {selectedCulture ? `🌱 ${selectedCulture.nom}${selectedCulture.variete ? ` (${selectedCulture.variete})` : ''}` : 'Aucune (général)'}
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-300 shrink-0 transition-transform ${showCultures ? 'rotate-180' : ''}`} />
            </button>

            {showCultures && (
              <div className="absolute z-20 left-0 right-0 mt-2 rounded-2xl bg-white border border-gray-100 shadow-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => { setCultureId('none'); setShowCultures(false) }}
                    className={`w-full flex items-center px-4 py-3.5 text-left text-sm font-medium transition-colors
                      ${cultureId === 'none' ? 'bg-[#2d4a2d]/5 text-[#2d4a2d]' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    {cultureId === 'none' && <span className="mr-2">✓</span>}
                    — Recette générale —
                  </button>
                  {cultures.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCultureId(c.id); setShowCultures(false) }}
                      className={`w-full flex items-center px-4 py-3.5 text-left text-sm font-medium transition-colors
                        ${cultureId === c.id ? 'bg-[#2d4a2d]/5 text-[#2d4a2d]' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {cultureId === c.id && <span className="mr-2">✓</span>}
                      🌱 {c.nom}{c.variete ? ` (${c.variete})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Quantité + Unité ── */}
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3 focus-within:border-[#2d4a2d] focus-within:ring-2 focus-within:ring-[#2d4a2d]/10 transition-all">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <Package className="h-4 w-4 text-[#2d4a2d]" />
            </div>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Quantité vendue (optionnel)</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={quantite}
                  onChange={e => setQuantite(e.target.value)}
                  className="w-24 bg-transparent text-lg font-bold text-gray-800 placeholder:text-gray-300 outline-none"
                />
                <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                  <Ruler className="h-3.5 w-3.5 text-gray-300" />
                  <select
                    value={unite}
                    onChange={e => setUnite(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-gray-600 outline-none appearance-none"
                  >
                    {UNITES_VENTE.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <MobileField label="Description (optionnelle)" icon={<FileText className="h-4 w-4 text-gray-400" />}>
            <input
              type="text"
              placeholder="Ex: Vente au marché central..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-gray-800 placeholder:text-gray-300 outline-none"
            />
          </MobileField>
        </form>

        {/* ── Bouton fixé en bas ── */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4">
          <button
            type="button"
            disabled={loading || !montant}
            onClick={handleSubmit as any}
            className="w-full h-14 rounded-2xl bg-[#2d4a2d] text-white text-base font-bold shadow-lg shadow-[#2d4a2d]/30
                       disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all"
          >
            {loading ? (
              <Spinner className="mx-auto h-6 w-6 text-white" />
            ) : (
              initialData ? 'Enregistrer les modifications' : 'Valider la recette →'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Version compacte (carte) ──────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4a2d]/10">
          <TrendingUp className="h-5 w-5 text-[#2d4a2d]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {initialData ? 'Modifier Recette' : 'Ajouter Recette'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <MobileField label="Montant" icon={<span className="text-sm font-bold text-[#2d4a2d]">F</span>} required>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              required
              className="w-full bg-transparent text-xl font-bold text-gray-800 placeholder:text-gray-300 outline-none"
            />
            <span className="text-xs font-semibold text-gray-400">FCFA</span>
          </div>
        </MobileField>

        <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50">
            <Package className="h-4 w-4 text-[#2d4a2d]" />
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Quantité (optionnel)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={quantite}
                onChange={e => setQuantite(e.target.value)}
                className="w-16 bg-transparent text-sm font-bold text-gray-800 placeholder:text-gray-300 outline-none"
              />
              <select
                value={unite}
                onChange={e => setUnite(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-500 outline-none appearance-none border-l border-gray-100 pl-2"
              >
                {UNITES_VENTE.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        <MobileField label="Description (optionnel)" icon={<FileText className="h-4 w-4 text-gray-400" />}>
          <input
            type="text"
            placeholder="Ex: Vente au marché"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none"
          />
        </MobileField>

        <button
          type="submit"
          disabled={loading || !montant}
          className="h-12 rounded-2xl bg-[#2d4a2d] text-white font-bold shadow-md shadow-[#2d4a2d]/20 disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {loading ? <Spinner className="mx-auto h-4 w-4" /> : (initialData ? 'Enregistrer' : 'Ajouter la recette')}
        </button>
      </form>
    </div>
  )
}
