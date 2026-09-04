'use client'

import { Depense, Recette } from '@/lib/types'
import { useMemo } from 'react'

interface MonthlyChartProps {
  depenses: Depense[]
  recettes: Recette[]
}

function getLastNMonths(n: number) {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    })
  }
  return months
}

export function MonthlyChart({ depenses, recettes }: MonthlyChartProps) {
  const months = useMemo(() => getLastNMonths(6), [])

  const data = useMemo(() => {
    return months.map(({ label, year, month }) => {
      const start = new Date(year, month, 1).getTime()
      const end = new Date(year, month + 1, 0, 23, 59, 59).getTime()

      const monthDeps = depenses
        .filter(d => { const t = new Date(d.created_at).getTime(); return t >= start && t <= end })
        .reduce((s, d) => s + d.montant, 0)

      const monthRecs = recettes
        .filter(r => { const t = new Date(r.created_at).getTime(); return t >= start && t <= end })
        .reduce((s, r) => s + r.montant, 0)

      return { label, deps: monthDeps, recs: monthRecs, solde: monthRecs - monthDeps }
    })
  }, [months, depenses, recettes])

  const maxVal = useMemo(() => Math.max(...data.flatMap(d => [d.deps, d.recs]), 1), [data])

  const formatShort = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
    return n.toString()
  }

  const BAR_HEIGHT = 130
  const BAR_WIDTH = 22

  const totals = {
    recs: data.reduce((s, d) => s + d.recs, 0),
    deps: data.reduce((s, d) => s + d.deps, 0),
  }
  const totalSolde = totals.recs - totals.deps

  return (
    <div className="flex flex-col bg-white dark:bg-[#111a11] border border-[#2d4a2d]/15 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d4a2d]/10">
        <div>
          <h3 className="text-[13px] font-bold text-[#1e3a1e] dark:text-white uppercase tracking-wide">Analyse Mensuelle</h3>
          <p className="text-[10px] text-[#2d4a2d]/40 dark:text-white/30 mt-0.5 font-medium">Recettes vs Dépenses — 6 derniers mois</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 bg-[#2d4a2d]" />
            <span className="text-[10px] text-[#2d4a2d]/60 dark:text-white/40 font-semibold uppercase tracking-wide">Recettes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 bg-[#2d4a2d]/20 dark:bg-white/20" />
            <span className="text-[10px] text-[#2d4a2d]/60 dark:text-white/40 font-semibold uppercase tracking-wide">Dépenses</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 px-5 pt-4 pb-2">
        <div className="flex items-end gap-3 justify-between" style={{ height: BAR_HEIGHT + 28 }}>
          {data.map(({ label, deps, recs }) => {
            const recH = Math.round((recs / maxVal) * BAR_HEIGHT)
            const depH = Math.round((deps / maxVal) * BAR_HEIGHT)
            return (
              <div key={label} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="flex items-end gap-1 w-full justify-center" style={{ height: BAR_HEIGHT }}>
                  {/* Recette bar — vert plein */}
                  <div
                    className="bg-[#2d4a2d] hover:bg-[#3d6a3d] transition-colors cursor-pointer"
                    style={{ width: BAR_WIDTH, height: Math.max(recH, recs > 0 ? 3 : 0) }}
                    title={`Recettes: ${formatShort(recs)} F`}
                  />
                  {/* Dépense bar — vert clair / gris */}
                  <div
                    className="bg-[#2d4a2d]/20 dark:bg-white/15 hover:bg-[#2d4a2d]/35 transition-colors cursor-pointer"
                    style={{ width: BAR_WIDTH, height: Math.max(depH, deps > 0 ? 3 : 0) }}
                    title={`Dépenses: ${formatShort(deps)} F`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[#2d4a2d]/40 dark:text-white/30 uppercase tracking-wide">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary footer */}
      <div className="grid grid-cols-3 border-t border-[#2d4a2d]/10">
        <div className="px-5 py-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/40 dark:text-white/30">Recettes</p>
          <p className="text-sm font-black text-[#2d4a2d] dark:text-green-400 mt-0.5">{formatShort(totals.recs)} F</p>
        </div>
        <div className="px-5 py-3 text-center border-x border-[#2d4a2d]/10">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/40 dark:text-white/30">Solde net</p>
          <p className={`text-sm font-black mt-0.5 ${totalSolde >= 0 ? 'text-[#2d4a2d] dark:text-green-400' : 'text-red-500'}`}>
            {totalSolde >= 0 ? '+' : ''}{formatShort(totalSolde)} F
          </p>
        </div>
        <div className="px-5 py-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/40 dark:text-white/30">Dépenses</p>
          <p className="text-sm font-black text-[#2d4a2d]/50 dark:text-white/50 mt-0.5">{formatShort(totals.deps)} F</p>
        </div>
      </div>
    </div>
  )
}
