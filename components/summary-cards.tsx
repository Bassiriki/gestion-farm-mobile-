'use client'

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

interface SummaryCardsProps {
  totalDepenses: number
  totalRecettes: number
}

export function SummaryCards({ totalDepenses, totalRecettes }: SummaryCardsProps) {
  const solde = totalRecettes - totalDepenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2d4a2d] to-[#1a2f1a] p-6 shadow-xl text-white">
      {/* Main — Recettes en haut */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-300" />
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Recettes</p>
        </div>
        <p className="text-4xl font-black tracking-tight text-white">
          {formatCurrency(totalRecettes)}
        </p>
      </div>

      {/* Stats Row — Dépenses | Solde */}
      <div className="flex items-center justify-between border-t border-white/20 pt-5">
        {/* Dépenses */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-300" />
            <p className="text-xs text-white/70">Dépenses</p>
          </div>
          <p className="text-lg font-bold text-red-200">{formatCurrency(totalDepenses)}</p>
        </div>

        <div className="h-10 w-[1px] bg-white/20 mx-4"></div>

        {/* Solde */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-amber-300" />
            <p className="text-xs text-white/70">Solde actuel</p>
          </div>
          <p className={`text-lg font-bold ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
            {formatCurrency(solde)}
          </p>
        </div>
      </div>
    </div>
  )
}
