'use client'

import { TrendingDown, TrendingUp, Wallet, Sprout } from 'lucide-react'

interface SummaryCardsProps {
  totalDepenses: number
  totalRecettes: number
  nbCulturesActives?: number
}

export function SummaryCards({ totalDepenses, totalRecettes, nbCulturesActives = 0 }: SummaryCardsProps) {
  const solde = totalRecettes - totalDepenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatShort = (amount: number) => {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M'
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k'
    return amount.toString()
  }

  // ── DESKTOP: 4 KPI cards vert/blanc, carrées ──────────────────────────────
  const DesktopCards = () => (
    <div className="hidden lg:grid grid-cols-4 gap-0 border border-[#2d4a2d]/20 rounded-none overflow-hidden">
      {/* Solde Net — fond vert foncé */}
      <div className="relative bg-[#2d4a2d] p-6 flex flex-col gap-3 border-r border-[#2d4a2d]/40">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Solde Net</p>
          <div className="flex h-9 w-9 items-center justify-center bg-white/10">
            <Wallet className="h-4 w-4 text-white" />
          </div>
        </div>
        <div>
          <p className={`text-3xl font-black tracking-tight leading-none ${solde >= 0 ? 'text-white' : 'text-red-300'}`}>
            {solde >= 0 ? '+' : ''}{formatShort(solde)}
            <span className="text-base font-semibold text-white/40 ml-1">F</span>
          </p>
          <p className="text-[11px] text-white/40 mt-1.5 font-medium">{formatCurrency(solde)}</p>
        </div>
        <div className={`self-start text-[10px] font-bold px-2.5 py-1 ${solde >= 0 ? 'bg-white/15 text-white' : 'bg-red-400/20 text-red-300'}`}>
          {solde >= 0 ? '▲ BÉNÉFICE' : '▼ DÉFICIT'}
        </div>
      </div>

      {/* Recettes — fond vert moyen */}
      <div className="relative bg-[#3d6a3d] p-6 flex flex-col gap-3 border-r border-[#2d4a2d]/40">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Recettes</p>
          <div className="flex h-9 w-9 items-center justify-center bg-white/10">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight leading-none text-white">
            {formatShort(totalRecettes)}
            <span className="text-base font-semibold text-white/40 ml-1">F</span>
          </p>
          <p className="text-[11px] text-white/40 mt-1.5 font-medium">{formatCurrency(totalRecettes)}</p>
        </div>
        <div className="self-start text-[10px] font-bold px-2.5 py-1 bg-white/15 text-white">
          ↑ TOTAL ACTIF
        </div>
      </div>

      {/* Dépenses — fond blanc avec bordure verte */}
      <div className="relative bg-white dark:bg-[#1a2d1a] p-6 flex flex-col gap-3 border-r border-[#2d4a2d]/20">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/50 dark:text-white/40">Dépenses</p>
          <div className="flex h-9 w-9 items-center justify-center bg-[#2d4a2d]/10">
            <TrendingDown className="h-4 w-4 text-[#2d4a2d] dark:text-green-400" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight leading-none text-red-500">
            {formatShort(totalDepenses)}
            <span className="text-base font-semibold text-red-300 ml-1">F</span>
          </p>
          <p className="text-[11px] text-[#2d4a2d]/40 dark:text-white/30 mt-1.5 font-medium">{formatCurrency(totalDepenses)}</p>
        </div>
        <div className="self-start text-[10px] font-bold px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-500">
          ↓ COÛTS TOTAUX
        </div>
      </div>

      {/* Cultures actives — fond blanc avec accent vert */}
      <div className="relative bg-white dark:bg-[#1a2d1a] p-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d4a2d]/50 dark:text-white/40">Cultures</p>
          <div className="flex h-9 w-9 items-center justify-center bg-[#2d4a2d]/10">
            <Sprout className="h-4 w-4 text-[#2d4a2d] dark:text-green-400" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-black tracking-tight leading-none text-[#2d4a2d] dark:text-green-400">
            {nbCulturesActives}
            <span className="text-base font-semibold text-[#2d4a2d]/40 dark:text-green-400/50 ml-1">actives</span>
          </p>
          <p className="text-[11px] text-[#2d4a2d]/40 dark:text-white/30 mt-1.5 font-medium">Cultures en production</p>
        </div>
        <div className="self-start text-[10px] font-bold px-2.5 py-1 bg-[#2d4a2d]/10 text-[#2d4a2d] dark:text-green-400">
          🌱 SAISON ACTIVE
        </div>
      </div>
    </div>
  )

  // ── MOBILE: hero card originale ───────────────────────────────────────────
  const MobileCard = () => (
    <div className="lg:hidden flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d4a2d] via-[#3d6a3d] to-[#1a3a1a] p-6 card-shadow-lg">
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

  return (
    <>
      <DesktopCards />
      <MobileCard />
    </>
  )
}
