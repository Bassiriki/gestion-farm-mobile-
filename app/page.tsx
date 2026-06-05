'use client'

import { CultureForm } from '@/components/culture-form'
import { CultureStats } from '@/components/culture-stats'
import { DepenseForm } from '@/components/depense-form'
import { ProductionCards } from '@/components/production-cards'
import { RecetteForm } from '@/components/recette-form'
import { SummaryCards } from '@/components/summary-cards'
import { TransactionsList } from '@/components/transactions-list'
import { AIChat } from '@/components/ai-chat'
import { WeatherCard } from '@/components/weather-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Culture, Depense, Recette } from '@/lib/types'
import { Activity, ArrowLeft, Home, LayoutGrid, Moon, Plus, Printer, Sun, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

async function fetchData() {
  const supabase = createClient()

  const [depensesRes, recettesRes, culturesRes] = await Promise.all([
    supabase.from('depenses').select('*').order('created_at', { ascending: false }),
    supabase.from('recettes').select('*').order('created_at', { ascending: false }),
    supabase.from('cultures').select('*').order('created_at', { ascending: false })
  ])

  return {
    depenses: (depensesRes.data || []) as Depense[],
    recettes: (recettesRes.data || []) as Recette[],
    cultures: (culturesRes.data || []) as Culture[]
  }
}

type TabType = 'accueil' | 'historique' | 'depense' | 'recette' | 'parametres' | 'add_culture'



export default function FarmManganePage() {
  const [activeTab, setActiveTab] = useState<TabType>('accueil')
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [isUnlocked] = useState(true)
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null)
  const { theme, setTheme } = useTheme()
  const { data, mutate } = useSWR('farm-data', fetchData, {
    fallbackData: { depenses: [], recettes: [], cultures: [] }
  })

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])


  const handleSuccess = useCallback(() => {
    mutate()
    setActiveTab('accueil')
    setShowAddMenu(false)
    setTransactionToEdit(null)
  }, [mutate])

  const handleEditTransaction = (transaction: any) => {
    setTransactionToEdit(transaction)
    if (transaction.type === 'depense') {
      setActiveTab('depense')
    } else {
      setActiveTab('recette')
    }
  }

  const totalDepenses = data?.depenses.reduce((sum, d) => sum + d.montant, 0) || 0
  const totalRecettes = data?.recettes.reduce((sum, r) => sum + r.montant, 0) || 0

  const getMonthlyTransactions = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyDepenses = data?.depenses.filter(d => new Date(d.created_at) >= startOfMonth) || []
    const monthlyRecettes = data?.recettes.filter(r => new Date(r.created_at) >= startOfMonth) || []

    return { monthlyDepenses, monthlyRecettes }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handlePrintPDF = () => {
    const { monthlyDepenses, monthlyRecettes } = getMonthlyTransactions()
    const totalMonthlyDepenses = monthlyDepenses.reduce((sum, d) => sum + d.montant, 0)
    const totalMonthlyRecettes = monthlyRecettes.reduce((sum, r) => sum + r.montant, 0)
    const solde = totalMonthlyRecettes - totalMonthlyDepenses

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Farm Mangane - Rapport Mensuel</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2d4a2d; }
          .logo { width: 80px; height: 80px; margin-bottom: 10px; }
          .title { color: #2d4a2d; font-size: 24px; font-weight: bold; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 12px; color: #666; }
          .summary-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
          .depense-value { color: #dc2626; }
          .recette-value { color: #2d4a2d; }
          .solde-value { color: ${solde >= 0 ? '#2d4a2d' : '#dc2626'}; }
          .section { margin: 25px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #2d4a2d; margin-bottom: 10px; border-bottom: 1px solid #ddd; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #2d4a2d; color: white; font-size: 12px; }
          td { font-size: 12px; }
          .amount-cell { text-align: right; font-weight: 600; }
          .back-btn { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; padding: 10px 20px; background: #2d4a2d; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
          .back-btn:hover { background: #3d5a3d; }
          @media print { .back-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="back-btn" onclick="window.close()">&#8592; Retour à l'application</button>
        <div class="header">
          <div class="title">FARM MANGANE</div>
          <div>Rapport Mensuel</div>
        </div>
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Dépenses</div>
            <div class="summary-value depense-value">${formatCurrency(totalMonthlyDepenses)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Recettes</div>
            <div class="summary-value recette-value">${formatCurrency(totalMonthlyRecettes)}</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Dépenses (${monthlyDepenses.length})</div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th style="text-align: right;">Montant</th></tr></thead>
            <tbody>
              ${monthlyDepenses.map(d => `<tr><td>${formatDate(d.created_at)}</td><td>${d.description || d.categorie}</td><td class="amount-cell depense-value">${formatCurrency(d.montant)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Recettes (${monthlyRecettes.length})</div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th style="text-align: right;">Montant</th></tr></thead>
            <tbody>
              ${monthlyRecettes.map(r => `<tr><td>${formatDate(r.created_at)}</td><td>${r.description || '-'} ${r.quantite ? '(' + r.quantite + ' ' + r.unite + ')' : ''}</td><td class="amount-cell recette-value">${formatCurrency(r.montant)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    setShowPrintDialog(false)
  }


  const FormHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-5 shadow-sm">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </header>
  )

  const PrintDialog = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Imprimer le rapport</h2>
            <button
              onClick={() => setShowPrintDialog(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-6 flex flex-col items-center gap-3">
            <p className="text-center text-sm text-muted-foreground">
              Voulez-vous imprimer le rapport du mois ?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => setShowPrintDialog(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-[#2d4a2d] text-white hover:bg-[#3d5a3d]"
              onClick={handlePrintPDF}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'depense') {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <FormHeader title="Ajouter Dépense" onBack={() => { setActiveTab('accueil'); setTransactionToEdit(null); }} />
        <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
          <DepenseForm onSuccess={handleSuccess} fullScreen initialData={transactionToEdit} />
        </div>
      </main>
    )
  }

  if (activeTab === 'recette') {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <FormHeader title="Ajouter Recette" onBack={() => { setActiveTab('accueil'); setTransactionToEdit(null); }} />
        <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
          <RecetteForm onSuccess={handleSuccess} fullScreen initialData={transactionToEdit} />
        </div>
      </main>
    )
  }

  if (activeTab === 'add_culture') {
    return (
      <main className="flex min-h-screen flex-col bg-background">
        <FormHeader title="Ajouter Culture" onBack={() => setActiveTab('parametres')} />
        <div className="mx-auto w-full max-w-lg flex-1">
          <CultureForm onSuccess={() => { mutate(); setActiveTab('parametres'); }} onCancel={() => setActiveTab('parametres')} />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {showPrintDialog && <PrintDialog />}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-5 shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Farm Mangane Logo"
              width={56}
              height={56}
              className="rounded-xl object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Farm Mangane</h1>
              <p className="text-sm text-muted-foreground">Gestion Agricole</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>
            <button
              onClick={() => setShowPrintDialog(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        {activeTab === 'accueil' && (
          <div className="flex flex-col gap-6">
            <SummaryCards totalDepenses={totalDepenses} totalRecettes={totalRecettes} />

            <WeatherCard />

            <CultureStats cultures={data?.cultures || []} depenses={data?.depenses || []} recettes={data?.recettes || []} />

            <ProductionCards cultures={data?.cultures || []} depenses={data?.depenses || []} recettes={data?.recettes || []} onNavigateToParametres={() => setActiveTab('parametres')} />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Transactions récentes</h2>
                <button
                  onClick={() => setActiveTab('historique')}
                  className="text-sm font-medium text-[#2d4a2d] dark:text-[#4ade80]"
                >
                  Voir tout
                </button>
              </div>
              <TransactionsList
                depenses={data?.depenses.slice(0, 3) || []}
                recettes={data?.recettes.slice(0, 3) || []}
                onDelete={handleRefresh}
                onEdit={handleEditTransaction}
                compact
              />
            </div>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground">Historique complet</h2>
            <TransactionsList
              depenses={data?.depenses || []}
              recettes={data?.recettes || []}
              onDelete={handleRefresh}
              onEdit={handleEditTransaction}
            />
          </div>
        )}

        {activeTab === 'parametres' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Paramètres Cultures</h2>
              <Button
                onClick={() => setActiveTab('add_culture')}
                className="rounded-xl bg-[#2d4a2d] text-white hover:bg-[#3d5a3d]"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Nouvelle
              </Button>
            </div>

            <ProductionCards cultures={data?.cultures || []} depenses={data?.depenses || []} recettes={data?.recettes || []} onNavigateToParametres={() => setActiveTab('add_culture')} />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-card border-t border-border">
        {/* Floating Add Menu */}
        {showAddMenu && (
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col gap-3 rounded-2xl bg-card p-3 shadow-xl border border-border">
            <button
              onClick={() => { setActiveTab('recette'); setShowAddMenu(false); }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20">
                <TrendingUp className="h-5 w-5 text-[#2d4a2d]" />
              </div>
              <span className="text-sm font-medium text-foreground">Ajouter Recette</span>
            </button>
            <button
              onClick={() => { setActiveTab('depense'); setShowAddMenu(false); }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-muted"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Ajouter Dépense</span>
            </button>
          </div>
        )}

        {/* Dim overlay when add menu is open */}
        {showAddMenu && (
          <div
            className="fixed inset-0 -z-10 bg-black/5 dark:bg-black/50"
            onClick={() => setShowAddMenu(false)}
          />
        )}

        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">

          <button
            onClick={() => { setActiveTab('accueil'); setShowAddMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${activeTab === 'accueil' ? 'text-[#2d4a2d] dark:text-[#4ade80]' : 'text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white/80'}`}
          >
            <Home className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-medium">Accueil</span>
          </button>

          <button
            onClick={() => { setActiveTab('historique'); setShowAddMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${activeTab === 'historique' ? 'text-[#2d4a2d] dark:text-[#4ade80]' : 'text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white/80'}`}
          >
            <Activity className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-medium">Historique</span>
          </button>

          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${showAddMenu ? 'text-[#2d4a2d] dark:text-[#4ade80]' : 'text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white/80'}`}
          >
            <Plus className="h-7 w-7 rounded-full border-[1.5px] border-current p-0.5" />
            <span className="text-[10px] font-medium">Ajouter</span>
          </button>

          <button
            onClick={() => { setActiveTab('parametres'); setShowAddMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 w-16 transition-colors ${activeTab === 'parametres' ? 'text-[#2d4a2d] dark:text-[#4ade80]' : 'text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white/80'}`}
          >
            <LayoutGrid className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-medium">Cultures</span>
          </button>

          <button
            onClick={() => { setShowPrintDialog(true); setShowAddMenu(false); }}
            className="flex flex-col items-center justify-center gap-1 w-16 transition-colors text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white/80"
          >
            <Printer className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-medium">Rapport</span>
          </button>

        </div>
      </nav>
      <AIChat cultures={data?.cultures || []} depenses={data?.depenses || []} recettes={data?.recettes || []} />
    </main>
  )
}
