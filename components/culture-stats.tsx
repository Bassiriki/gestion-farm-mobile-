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
import { Sprout, TrendingDown, TrendingUp } from 'lucide-react'

interface CultureStatsProps {
  cultures: Culture[]
  depenses: Depense[]
  recettes: Recette[]
}

export function CultureStats({ cultures, depenses, recettes }: CultureStatsProps) {
  const [selectedCulture, setSelectedCulture] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  // Stats par culture
  const cultureStats = cultures.map(culture => {
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
  }).filter(s => s.nbTransactions > 0) // N'afficher que les cultures avec des transactions

  if (cultures.length === 0 || cultureStats.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">Résumé par culture</h2>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
        {cultureStats.map(({ culture, totalDeps, totalRecs, solde }) => (
          <Dialog key={culture.id}>
            <DialogTrigger asChild>
              <button className="flex min-w-[160px] flex-col gap-3 rounded-2xl bg-[#0d0d0d] p-4 text-white shadow-md transition-all active:scale-95 hover:bg-[#1a1a1a]">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Sprout className="h-4 w-4 text-white" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${solde >= 0 ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'}`}>
                    {solde >= 0 ? 'Bénéfice' : 'Déficit'}
                  </span>
                </div>
                {/* Culture name */}
                <div>
                  <p className="text-sm font-bold leading-tight truncate">{culture.nom}</p>
                  {culture.variete && (
                    <p className="text-[11px] text-white/50 truncate">{culture.variete}</p>
                  )}
                </div>
                {/* Solde */}
                <p className={`text-base font-bold ${solde >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {solde >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(solde)} F
                </p>
                {/* Dépenses / Recettes */}
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-400" />
                    <span className="text-[10px] text-white/60">{new Intl.NumberFormat('fr-FR').format(totalDeps)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-[10px] text-white/60">{new Intl.NumberFormat('fr-FR').format(totalRecs)}</span>
                  </div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a2d]/10">
                    <Sprout className="h-4 w-4 text-[#2d4a2d]" />
                  </div>
                  <span>Détails {culture.nom}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/50 p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Bénéfice net</p>
                  <p className={`text-2xl font-bold ${solde >= 0 ? 'text-[#2d4a2d]' : 'text-red-500'}`}>
                    {solde >= 0 ? '+' : ''}{formatCurrency(solde)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-xs text-muted-foreground">Dépenses</span>
                    </div>
                    <span className="text-base font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(totalDeps)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-green-100 bg-green-50/50 dark:border-[#2d4a2d]/30 dark:bg-[#2d4a2d]/10 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-[#2d4a2d]/30">
                        <TrendingUp className="h-3 w-3 text-[#2d4a2d] dark:text-green-400" />
                      </div>
                      <span className="text-xs text-muted-foreground">Recettes</span>
                    </div>
                    <span className="text-base font-semibold text-[#2d4a2d] dark:text-green-400">
                      {formatCurrency(totalRecs)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
