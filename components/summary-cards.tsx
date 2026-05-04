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
    <div className="rounded-3xl bg-gradient-to-br from-[#2d4a2d] to-[#1a2f1a] p-6 shadow-xl text-white">
      {/* Main Balance */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-white/80">Solde actuel</p>
          <p className={`text-3xl font-bold mt-1 ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
            {formatCurrency(solde)}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <Wallet className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between border-t border-white/20 pt-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-400/20">
              <TrendingDown className="h-3 w-3 text-red-300" />
            </div>
            <p className="text-xs text-white/80">Dépenses</p>
          </div>
          <p className="text-sm font-semibold text-red-200">{formatCurrency(totalDepenses)}</p>
        </div>
        
        <div className="h-8 w-[1px] bg-white/20 mx-4"></div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20">
              <TrendingUp className="h-3 w-3 text-green-300" />
            </div>
            <p className="text-xs text-white/80">Recettes</p>
          </div>
          <p className="text-sm font-semibold text-green-200">{formatCurrency(totalRecettes)}</p>
        </div>
      </div>
    </div>
  )
}
