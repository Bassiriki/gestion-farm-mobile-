'use client'

import { Badge } from '@/components/ui/badge'
import { Depense, Recette, Culture } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { History, Trash2, Edit, TrendingDown, TrendingUp, Sprout, Search } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface TransactionsListProps {
  depenses: Depense[]
  recettes: Recette[]
  cultures?: Culture[]
  onDelete: () => void
  onEdit?: (transaction: any) => void
  compact?: boolean
}

type Transaction = (Depense & { type: 'depense' }) | (Recette & { type: 'recette' })

export function TransactionsList({ depenses, recettes, cultures = [], onDelete, onEdit, compact }: TransactionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const getCultureName = (cultureId: string | null) => {
    if (!cultureId) return null
    const culture = cultures.find(c => c.id === cultureId)
    return culture ? culture.nom : null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3600000)
    const diffD = Math.floor(diffMs / 86400000)
    if (diffH < 1) return "À l'instant"
    if (diffH < 24) return `il y a ${diffH}h`
    if (diffD < 7) return `il y a ${diffD}j`
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const transactions: Transaction[] = useMemo(() => {
    return [
      ...depenses.map((d) => ({ ...d, type: 'depense' as const })),
      ...recettes.map((b) => ({ ...b, type: 'recette' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [depenses, recettes])

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions
    const lowerQuery = searchQuery.toLowerCase()
    return transactions.filter(t => {
      const cultureName = getCultureName(t.culture_id)?.toLowerCase() || ''
      const description = t.description?.toLowerCase() || ''
      const categorie = t.type === 'depense' && 'categorie' in t ? t.categorie.toLowerCase() : ''
      const typeName = t.type === 'depense' ? 'dépense depense' : 'recette vente'
      const amountStr = t.montant.toString()
      return description.includes(lowerQuery) || categorie.includes(lowerQuery) || cultureName.includes(lowerQuery) || typeName.includes(lowerQuery) || amountStr.includes(lowerQuery)
    })
  }, [transactions, searchQuery, cultures])

  const displayTransactions = compact ? transactions.slice(0, 5) : filteredTransactions

  const handleDelete = async (id: string, type: 'depense' | 'recette') => {
    if (!confirm('Supprimer cette transaction ?')) return
    const supabase = createClient()
    const table = type === 'depense' ? 'depenses' : 'recettes'
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) onDelete()
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-3xl bg-card card-shadow border border-border">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Aucune transaction</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {!compact && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card pl-11 pr-4 py-3 text-sm outline-none focus:border-[#2d4a2d] card-shadow placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      {!compact && searchQuery && filteredTransactions.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Aucun résultat pour "{searchQuery}"
        </div>
      )}

      <div className="flex flex-col gap-2">
        {displayTransactions.map((transaction) => {
          const isExpanded = expandedId === transaction.id
          const cultureName = getCultureName(transaction.culture_id)
          const isDepense = transaction.type === 'depense'

          return (
            <div
              key={transaction.id}
              className="rounded-2xl bg-card border border-border card-shadow overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50"
                onClick={() => !compact && setExpandedId(isExpanded ? null : transaction.id)}
              >
                {/* Icon */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isDepense ? 'bg-red-50 dark:bg-red-950/30' : 'bg-[#e8f4e8] dark:bg-[#2d4a2d]/20'}`}>
                  {isDepense ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-[#2d4a2d] dark:text-green-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {transaction.description || (isDepense ? ('categorie' in transaction ? transaction.categorie : 'Dépense') : 'Recette')}
                    </p>
                    <span className={`shrink-0 text-sm font-bold ${isDepense ? 'text-red-500' : 'text-[#2d4a2d] dark:text-green-400'}`}>
                      {isDepense ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(transaction.montant)} F
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {isDepense && 'categorie' in transaction && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400">
                        {transaction.categorie}
                      </span>
                    )}
                    {cultureName && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#e8f4e8] dark:bg-[#2d4a2d]/20 text-[#2d4a2d] dark:text-green-400">
                        <Sprout className="h-2.5 w-2.5" />
                        {cultureName}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(transaction.created_at)}</span>
                  </div>
                </div>
              </button>

              {/* Expanded actions */}
              {isExpanded && !compact && (
                <div className="flex items-center gap-2 px-4 pb-4 pt-0">
                  <button
                    onClick={() => onEdit?.(transaction)}
                    className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted/80"
                  >
                    <Edit className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id, transaction.type)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
