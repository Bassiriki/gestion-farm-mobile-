'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Depense, Recette, Culture } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { History, Trash2, Edit, Eye, TrendingDown, TrendingUp, Sprout, Search } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'

interface TransactionsListProps {
  depenses: Depense[]
  recettes: Recette[]
  onDelete: () => void
  onEdit?: (transaction: any) => void
  compact?: boolean
}

type Transaction = (Depense & { type: 'depense' }) | (Recette & { type: 'recette' })

export function TransactionsList({ depenses, recettes, onDelete, onEdit, compact }: TransactionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cultures, setCultures] = useState<Culture[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('farm_cultures')
    if (stored) setCultures(JSON.parse(stored))
  }, [])

  const getCultureName = (cultureId: string | null) => {
    if (!cultureId) return null
    const culture = cultures.find(c => c.id === cultureId)
    return culture ? culture.nom : null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
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

      return (
        description.includes(lowerQuery) ||
        categorie.includes(lowerQuery) ||
        cultureName.includes(lowerQuery) ||
        typeName.includes(lowerQuery) ||
        amountStr.includes(lowerQuery)
      )
    })
  }, [transactions, searchQuery, cultures])

  const displayTransactions = compact ? transactions.slice(0, 5) : filteredTransactions

  const handleDelete = async (id: string, type: 'depense' | 'recette') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return
    
    const supabase = createClient()
    const table = type === 'depense' ? 'depenses' : 'recettes'
    
    const { error } = await supabase.from(table).delete().eq('id', id)
    
    if (!error) {
      onDelete()
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <History className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-center text-muted-foreground">
            Aucune transaction pour le moment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {!compact && (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Historique ({filteredTransactions.length})</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher (description, montant, culture...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/50"
            />
          </div>
        </div>
      )}
      
      <div className="divide-y divide-border">
        {displayTransactions.length === 0 && searchQuery && (
          <div className="py-8 text-center text-muted-foreground">
            Aucun résultat pour "{searchQuery}"
          </div>
        )}
        {displayTransactions.map((transaction) => {
          const isExpanded = expandedId === transaction.id
          const cultureName = getCultureName(transaction.culture_id)
          
          return (
            <div key={transaction.id} className="flex flex-col px-5 py-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  transaction.type === 'depense' ? 'bg-red-50 dark:bg-red-950/50' : 'bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20'
                }`}>
                  {transaction.type === 'depense' ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-[#2d4a2d]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : transaction.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold ${
                      transaction.type === 'depense' ? 'text-red-500' : 'text-[#2d4a2d] dark:text-green-400'
                    }`}>
                      {transaction.type === 'depense' ? '-' : '+'}{formatCurrency(transaction.montant)}
                    </span>
                    {transaction.type === 'depense' && 'categorie' in transaction && (
                      <Badge variant="secondary" className="rounded-full bg-muted text-xs text-muted-foreground">
                        {transaction.categorie}
                      </Badge>
                    )}
                    {/* Culture badge */}
                    {cultureName && (
                      <Badge variant="outline" className="rounded-full text-xs text-[#2d4a2d] border-[#2d4a2d]/30 bg-[#2d4a2d]/5 flex items-center gap-1">
                        <Sprout className="h-3 w-3" />
                        {cultureName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate max-w-[70%]">
                      {transaction.description || (transaction.type === 'depense' ? 'Dépense' : 'Recette')}
                      {transaction.type === 'recette' && transaction.quantite && ` (${transaction.quantite} ${transaction.unite})`}
                    </p>
                    <p className="text-xs text-muted-foreground shrink-0">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>

                {!compact && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Detail view */}
              {isExpanded && !compact && (
                <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={() => onEdit?.(transaction)}
                  >
                    <Edit className="mr-2 h-3 w-3" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50"
                    onClick={() => handleDelete(transaction.id, transaction.type)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" /> Supprimer
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
