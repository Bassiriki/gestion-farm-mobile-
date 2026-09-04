'use client'

import { Culture, Depense, Recette } from '@/lib/types'
import { Sprout, TrendingDown, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface DesktopRightPanelProps {
  cultures: Culture[]
  depenses: Depense[]
  recettes: Recette[]
}

const DOTS = ['bg-[#2d4a2d]', 'bg-[#3d6a3d]', 'bg-[#4a8a4a]', 'bg-[#2d4a2d]/60', 'bg-[#3d6a3d]/60']

export function DesktopRightPanel({ cultures, depenses, recettes }: DesktopRightPanelProps) {
  const formatShort = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
    return n.toString()
  }

  const activeCultures = cultures.filter(c => c.statut === 'en_cours')
  const closedCultures = cultures.filter(c => c.statut !== 'en_cours')

  const cultureStats = activeCultures.map(culture => {
    const deps = depenses.filter(d => d.culture_id === culture.id).reduce((s, d) => s + d.montant, 0)
    const recs = recettes.filter(r => r.culture_id === culture.id).reduce((s, r) => s + r.montant, 0)
    return { culture, deps, recs, solde: recs - deps }
  })

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111a11] border border-[#2d4a2d]/15">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#2d4a2d]/10">
        <h3 className="text-[13px] font-bold text-[#1e3a1e] dark:text-white uppercase tracking-wide">Résumé Cultures</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 border-b border-[#2d4a2d]/10">
        <div className="px-5 py-4 border-r border-[#2d4a2d]/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock style={{ width: '11px', height: '11px' }} className="text-[#2d4a2d]/50 dark:text-green-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/40 dark:text-white/30">En cours</span>
          </div>
          <p className="text-2xl font-black text-[#2d4a2d] dark:text-green-400">{activeCultures.length}</p>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 style={{ width: '11px', height: '11px' }} className="text-[#2d4a2d]/30 dark:text-white/30" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/40 dark:text-white/30">Terminées</span>
          </div>
          <p className="text-2xl font-black text-[#2d4a2d]/40 dark:text-white/40">{closedCultures.length}</p>
        </div>
      </div>

      {/* Cultures list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {cultureStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Sprout style={{ width: '28px', height: '28px' }} className="text-[#2d4a2d]/15" />
            <p className="text-[11px] text-[#2d4a2d]/30 dark:text-white/20 font-medium">Aucune culture active</p>
          </div>
        ) : (
          cultureStats.slice(0, 5).map(({ culture, deps, recs, solde }, idx) => (
            <div key={culture.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2d4a2d]/8 dark:border-white/5 hover:bg-[#2d4a2d]/4 dark:hover:bg-white/3 transition-colors">
              <span className={`h-2.5 w-2.5 shrink-0 ${DOTS[idx % DOTS.length]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#1e3a1e] dark:text-white truncate">{culture.nom}</p>
                {culture.variete && (
                  <p className="text-[10px] text-[#2d4a2d]/40 dark:text-white/30 truncate">{culture.variete}</p>
                )}
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className={`text-[12px] font-black ${solde >= 0 ? 'text-[#2d4a2d] dark:text-green-400' : 'text-red-500'}`}>
                  {solde >= 0 ? '+' : ''}{formatShort(solde)} F
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-[#2d4a2d]/30 dark:text-white/20">↓{formatShort(deps)}</span>
                  <span className="text-[9px] text-[#2d4a2d]/30 dark:text-white/20">↑{formatShort(recs)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tip footer */}
      <div className="bg-[#2d4a2d] px-5 py-4">
        <div className="flex items-start gap-2.5">
          <Sprout style={{ width: '14px', height: '14px' }} className="text-white/50 mt-0.5 shrink-0" />
          <p className="text-[10px] text-white/60 leading-relaxed font-medium">
            Enregistrez vos dépenses régulièrement pour un suivi précis de vos cultures.
          </p>
        </div>
      </div>
    </div>
  )
}
