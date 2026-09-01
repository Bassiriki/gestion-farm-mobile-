'use client'

import { TrendingDown, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react'

interface SummaryCardsProps {
  totalDepenses: number
  totalRecettes: number
}

export function SummaryCards({ totalDepenses, totalRecettes }: SummaryCardsProps) {
  const solde = totalRecettes - totalDepenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatShort = (amount: number) => {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M'
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k'
    return amount.toString()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main hero card — solde */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d4a2d] via-[#3d6a3d] to-[#1a3a1a] p-6 card-shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">Solde actuel</p>
          <p className={`text-4xl font-black tracking-tight ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
            {solde >= 0 ? '+' : ''}{formatShort(solde)}
            <span className="text-lg font-semibold text-white/60 ml-1">FCFA</span>
          </p>
          <p className="text-sm text-white/50 mt-1">{formatCurrency(solde)}</p>
        </div>

        {/* Stats row */}
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
                <TrendingUp className="h-3 w-3 text-emerald-300" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Recettes</p>
            </div>
            <p className="text-base font-bold text-white">{formatShort(totalRecettes)}</p>
            <p className="text-[10px] text-white/40">FCFA</p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/20">
                <TrendingDown className="h-3 w-3 text-red-300" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Dépenses</p>
            </div>
            <p className="text-base font-bold text-red-200">{formatShort(totalDepenses)}</p>
            <p className="text-[10px] text-white/40">FCFA</p>
          </div>
        </div>
      </div>
    </div>
  )
}
