'use client'

import { Printer, Moon, Sun, TrendingDown, TrendingUp } from 'lucide-react'
import { useTheme } from 'next-themes'

type TabType = 'accueil' | 'historique' | 'depense' | 'recette' | 'parametres' | 'add_culture'

interface DesktopTopbarProps {
  activeTab: TabType
  onPrint: () => void
  onAddRecette: () => void
  onAddDepense: () => void
}

const PAGE_TITLES: Record<string, string> = {
  accueil: 'Tableau de Bord',
  historique: 'Historique des Transactions',
  parametres: 'Gestion des Cultures',
  depense: 'Ajouter une Dépense',
  recette: 'Ajouter une Recette',
  add_culture: 'Nouvelle Culture',
}

export function DesktopTopbar({ activeTab, onPrint, onAddRecette, onAddDepense }: DesktopTopbarProps) {
  const { theme, setTheme } = useTheme()

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateCapitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  return (
    <header className="hidden lg:flex h-[60px] items-center justify-between border-b border-[#2d4a2d]/15 bg-white dark:bg-[#111a11] px-6 shrink-0 sticky top-0 z-20">
      {/* Left: breadcrumb + title */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-1 bg-[#2d4a2d]" />
        <div>
          <h1 className="text-[15px] font-bold text-[#1e3a1e] dark:text-white leading-tight">
            {PAGE_TITLES[activeTab] ?? 'Farm Mangane'}
          </h1>
          <p className="text-[10px] text-[#2d4a2d]/50 dark:text-white/30 font-medium">{dateCapitalized}</p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {activeTab === 'accueil' && (
          <>
            <button
              onClick={onAddRecette}
              className="flex items-center gap-1.5 bg-[#2d4a2d] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#3d6a3d] transition-colors"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Recette
            </button>
            <button
              onClick={onAddDepense}
              className="flex items-center gap-1.5 border border-[#2d4a2d]/20 bg-white dark:bg-transparent px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <TrendingDown className="h-3.5 w-3.5" />
              Dépense
            </button>
          </>
        )}

        <div className="mx-2 h-5 w-px bg-[#2d4a2d]/15" />

        <button
          onClick={onPrint}
          title="Imprimer"
          className="flex h-8 w-8 items-center justify-center text-[#2d4a2d]/40 hover:bg-[#2d4a2d]/8 hover:text-[#2d4a2d] transition-colors dark:text-white/30 dark:hover:text-white"
        >
          <Printer className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center text-[#2d4a2d]/40 hover:bg-[#2d4a2d]/8 hover:text-[#2d4a2d] transition-colors dark:text-white/30 dark:hover:text-white"
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 block dark:hidden" />
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center bg-[#2d4a2d] text-[11px] font-bold text-white select-none ml-1">
          FM
        </div>
      </div>
    </header>
  )
}
