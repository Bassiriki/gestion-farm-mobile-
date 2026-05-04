'use client'

import { useEffect, useState } from 'react'
import { Sprout, CheckCircle2, Clock, Calendar, ChevronRight } from 'lucide-react'
import { Culture } from '@/lib/types'

interface ProductionCardsProps {
  onNavigateToParametres?: () => void
}

export function ProductionCards({ onNavigateToParametres }: ProductionCardsProps) {
  const [cultures, setCultures] = useState<Culture[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('farm_cultures')
    if (stored) setCultures(JSON.parse(stored))
  }, [])

  const enCours = cultures.filter((c) => c.statut === 'en_cours')
  const recoltes = cultures.filter((c) => c.statut === 'recolte')

  if (cultures.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Productions</h2>
          <button
            onClick={onNavigateToParametres}
            className="text-sm font-medium text-[#2d4a2d]"
          >
            Gérer
          </button>
        </div>
        <button
          onClick={onNavigateToParametres}
          className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2d4a2d]/20 bg-[#2d4a2d]/5 p-5 text-[#2d4a2d] transition-all hover:border-[#2d4a2d]/40"
        >
          <Sprout className="h-5 w-5" />
          <span className="text-sm font-medium">Ajouter une culture</span>
        </button>
      </div>
    )
  }

  function getDaysLabel(dateStr: string | null) {
    if (!dateStr) return null
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    return days === 0 ? "Aujourd'hui" : `${days}j`
  }

  function getHarvestLabel(dateStr: string | null) {
    if (!dateStr) return null
    const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
    if (diff < 0) return 'Dépassé'
    if (diff === 0) return "Auj."
    return `${diff}j`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Productions</h2>
        <button onClick={onNavigateToParametres} className="flex items-center gap-1 text-sm font-medium text-[#2d4a2d]">
          Gérer <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* En cours */}
      {enCours.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {enCours.map((culture) => (
            <div
              key={culture.id}
              className="flex min-w-[150px] flex-col gap-2 rounded-2xl bg-gradient-to-br from-[#2d4a2d] to-[#3d6a3d] p-4 text-white shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Sprout className="h-4 w-4 text-white" />
                </div>
                <span className="rounded-full bg-green-300/30 px-2 py-0.5 text-[10px] font-semibold text-green-100">
                  En cours
                </span>
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{culture.nom}</p>
                {culture.variete && (
                  <p className="text-xs text-white/70">{culture.variete}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                {culture.date_plantation && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/60" />
                    <span className="text-[11px] text-white/80">
                      {getDaysLabel(culture.date_plantation)}
                    </span>
                  </div>
                )}
                {culture.date_recolte_prevue && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-white/60" />
                    <span className="text-[11px] text-white/80">
                      {getHarvestLabel(culture.date_recolte_prevue)}
                    </span>
                  </div>
                )}
              </div>
              {culture.surface && (
                <p className="text-[10px] text-white/50">{culture.surface}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Récoltés */}
      {recoltes.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {recoltes.map((culture) => (
            <div
              key={culture.id}
              className="flex min-w-[140px] flex-col gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Récolté
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{culture.nom}</p>
                {culture.variete && (
                  <p className="text-xs text-muted-foreground">{culture.variete}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
