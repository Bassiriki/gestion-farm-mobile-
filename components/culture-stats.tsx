'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Culture, Depense, Recette } from '@/lib/types'
import { Sprout, TrendingDown, TrendingUp, ArrowUpRight } from 'lucide-react'

interface CultureStatsProps {
  cultures: Culture[]
  depenses: Depense[]
  recettes: Recette[]
}

export function CultureStats({ cultures, depenses, recettes }: CultureStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatShort = (amount: number) => {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M'
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k'
    return amount.toString()
  }

  // Stats par culture — seulement les actives (en_cours)
  const cultureStats = cultures
    .filter(c => c.statut === 'en_cours')
    .map(culture => {
      const cultureDeps = depenses.filter(d => d.culture_id === culture.id)
      const cultureRecs = recettes.filter(r => r.culture_id === culture.id)
      const totalDeps = cultureDeps.reduce((s, d) => s + d.montant, 0)
      const totalRecs = cultureRecs.reduce((s, r) => s + r.montant, 0)
      return {
        culture,
        totalDeps,
        totalRecs,
        solde: totalRecs - totalDeps,
        nbTransactions: cultureDeps.length + cultureRecs.length
      }
    }).filter(s => s.nbTransactions > 0)

  if (cultures.length === 0 || cultureStats.length === 0) {
    return null
  }

  const CARD_COLORS = [
    { bg: 'from-[#2d4a2d] to-[#1a3a1a]', badge: 'bg-emerald-400/20 text-emerald-300', icon: 'bg-white/15' },
    { bg: 'from-[#1a3a4a] to-[#0d2030]', badge: 'bg-blue-400/20 text-blue-300', icon: 'bg-white/15' },
    { bg: 'from-[#4a2d1a] to-[#2d1a0d]', badge: 'bg-orange-400/20 text-orange-300', icon: 'bg-white/15' },
    { bg: 'from-[#3a1a4a] to-[#201030]', badge: 'bg-purple-400/20 text-purple-300', icon: 'bg-white/15' },
    { bg: 'from-[#4a1a2d] to-[#2d0d1a]', badge: 'bg-pink-400/20 text-pink-300', icon: 'bg-white/15' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Résumé par culture</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {cultureStats.map(({ culture, totalDeps, totalRecs, solde }, idx) => {
          const colors = CARD_COLORS[idx % CARD_COLORS.length]
          return (
            <Dialog key={culture.id}>
              <DialogTrigger asChild>
                <button className={`relative flex min-w-[160px] flex-col gap-3 rounded-3xl bg-gradient-to-br ${colors.bg} p-4 text-white shadow-md transition-all active:scale-95 hover:scale-[1.02] overflow-hidden`}>
                  {/* Decorative circle */}
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
                  {/* Top row */}
                  <div className="relative flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.icon}`}>
                      <Sprout className="h-4 w-4 text-white" />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.badge}`}>
                      {solde >= 0 ? '▲ Bénéf.' : '▼ Déficit'}
                    </span>
                  </div>
                  {/* Name */}
                  <div className="relative">
                    <p className="text-sm font-bold leading-tight truncate">{culture.nom}</p>
                    {culture.variete && (
                      <p className="text-[11px] text-white/50 truncate">{culture.variete}</p>
                    )}
                  </div>
                  {/* Solde */}
                  <p className={`relative text-xl font-black ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
                    {solde >= 0 ? '+' : ''}{formatShort(solde)}<span className="text-xs font-medium text-white/50 ml-0.5">F</span>
                  </p>
                  {/* Bar */}
                  <div className="relative flex items-center justify-between border-t border-white/10 pt-2">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-300" />
                      <span className="text-[10px] text-white/60">{formatShort(totalDeps)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-300" />
                      <span className="text-[10px] text-white/60">{formatShort(totalRecs)}</span>
                    </div>
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md rounded-3xl border-0 card-shadow-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.bg}`}>
                      <Sprout className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="block text-base font-bold">Détails {culture.nom}</span>
                      {culture.variete && <span className="block text-xs font-normal text-muted-foreground">{culture.variete}</span>}
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                  {/* Hero solde */}
                  <div className={`flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${colors.bg} p-6 relative overflow-hidden`}>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">Bénéfice net</p>
                    <p className={`text-3xl font-black ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
                      {solde >= 0 ? '+' : ''}{formatCurrency(solde)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 rounded-2xl border border-red-100 bg-red-50/60 dark:border-red-900/20 dark:bg-red-950/10 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">Dépenses</p>
                      <p className="text-base font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDeps)}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-green-100 bg-green-50/60 dark:border-[#2d4a2d]/20 dark:bg-[#2d4a2d]/10 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 dark:bg-[#2d4a2d]/30">
                        <TrendingUp className="h-4 w-4 text-[#2d4a2d] dark:text-green-400" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">Recettes</p>
                      <p className="text-base font-bold text-[#2d4a2d] dark:text-green-400">{formatCurrency(totalRecs)}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>
    </div>
  )
}
