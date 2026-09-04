'use client'

import Image from 'next/image'
import { Activity, Home, LayoutGrid, Moon, Printer, Sun, TrendingDown, TrendingUp, Sprout, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'

type TabType = 'accueil' | 'historique' | 'depense' | 'recette' | 'parametres' | 'add_culture'

interface DesktopSidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  onPrint: () => void
}

const navItems = [
  { id: 'accueil' as TabType, label: 'Tableau de bord', icon: Home },
  { id: 'historique' as TabType, label: 'Historique', icon: Activity },
  { id: 'parametres' as TabType, label: 'Cultures', icon: LayoutGrid },
]

const quickActions = [
  { id: 'recette' as TabType, label: 'Ajouter Recette', icon: TrendingUp },
  { id: 'depense' as TabType, label: 'Ajouter Dépense', icon: TrendingDown },
]

export function DesktopSidebar({ activeTab, setActiveTab, onPrint }: DesktopSidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[220px] z-30 bg-[#1e3a1e] overflow-hidden border-r border-[#2d4a2d]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="relative h-9 w-9 shrink-0 bg-white/10 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Farm Mangane"
            width={36}
            height={36}
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Farm Mangane</p>
          <p className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.12em]">Gestion Agricole</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-5 flex flex-col gap-0.5">
        <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">Navigation</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium transition-all duration-100
                ${isActive
                  ? 'bg-white text-[#1e3a1e] font-bold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon className={`shrink-0 ${isActive ? 'text-[#1e3a1e]' : 'text-white/50 group-hover:text-white'}`} style={{ width: '16px', height: '16px' }} />
              <span className="flex-1 text-left text-[13px]">{label}</span>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#2d4a2d]" />}
            </button>
          )
        })}

        <div className="my-4 border-t border-white/10" />

        <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">Actions rapides</p>
        {quickActions.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="group flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all duration-100"
          >
            <Icon className="shrink-0 text-white/40 group-hover:text-white/80" style={{ width: '16px', height: '16px' }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-3 py-4 flex flex-col gap-0.5">
        <button
          onClick={onPrint}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all"
        >
          <Printer style={{ width: '16px', height: '16px' }} className="shrink-0" />
          <span>Imprimer Rapport</span>
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all"
        >
          <Sun style={{ width: '16px', height: '16px' }} className="hidden dark:block shrink-0" />
          <Moon style={{ width: '16px', height: '16px' }} className="block dark:hidden shrink-0" />
          <span className="dark:hidden">Mode Sombre</span>
          <span className="hidden dark:inline">Mode Clair</span>
        </button>

        {/* Version info */}
        <div className="mt-3 px-3 py-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Sprout style={{ width: '13px', height: '13px' }} className="text-white/30" />
            <span className="text-[10px] text-white/25 font-medium">Kaolack, Sénégal</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
