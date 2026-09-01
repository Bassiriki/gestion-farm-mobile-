'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Culture, Depense, Recette, Client, CultureClient } from '@/lib/types'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wallet,
  Users,
  Archive,
  RotateCcw,
  X,
  Lock,
} from 'lucide-react'

interface ProductionCardsProps {
  cultures: Culture[]
  depenses: Depense[]
  recettes: Recette[]
  clients?: Client[]
  cultureClients?: CultureClient[]
  onNavigateToParametres?: () => void
  onUpdate?: () => void
}

export function ProductionCards({
  cultures,
  depenses,
  recettes,
  clients = [],
  cultureClients = [],
  onNavigateToParametres,
  onUpdate,
}: ProductionCardsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showCloturees, setShowCloturees] = useState(false)
  const enCours = cultures.filter((c) => c.statut === 'en_cours')
  const recoltes = cultures.filter((c) => c.statut === 'recolte')
  const cloturees = cultures.filter((c) => c.statut === 'cloture')

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

  function getDaysLabel(dateStr: string | null) {
    if (!dateStr) return null
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    return days === 0 ? "Aujourd'hui" : `${days}j`
  }

  function getHarvestLabel(dateStr: string | null) {
    if (!dateStr) return null
    const diff = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
    if (diff < 0) return 'Dépassé'
    if (diff === 0) return 'Auj.'
    return `${diff}j`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }

  const handleCloturer = async (cultureId: string) => {
    setLoadingId(cultureId)
    const supabase = createClient()
    const { error } = await supabase
      .from('cultures')
      .update({ statut: 'cloture' })
      .eq('id', cultureId)

    if (!error && onUpdate) {
      onUpdate()
    }
    setLoadingId(null)
  }

  const handleRecuperer = async (cultureId: string) => {
    setLoadingId(cultureId)
    const supabase = createClient()
    const { error } = await supabase
      .from('cultures')
      .update({ statut: 'en_cours' })
      .eq('id', cultureId)

    if (!error && onUpdate) {
      onUpdate()
      setShowCloturees(false)
    }
    setLoadingId(null)
  }

  if (cultures.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Productions</h2>
          <button onClick={onNavigateToParametres} className="text-sm font-medium text-[#2d4a2d]">
            Gérer
          </button>
        </div>
        <button
          onClick={onNavigateToParametres}
          className="flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2d4a2d]/20 bg-[#2d4a2d]/5 p-5 text-[#2d4a2d] transition-all hover:border-[#2d4a2d]/40"
        >
          <Sprout className="h-5 w-5" />
          <span className="text-sm font-medium">Ajouter une culture</span>
        </button>
      </div>
    )
  }

  const CultureCard = ({ culture, variant }: { culture: Culture; variant: 'en_cours' | 'recolte' }) => {
    const cultureDeps = depenses.filter((d) => d.culture_id === culture.id)
    const cultureRecs = recettes.filter((r) => r.culture_id === culture.id)
    const totalDeps = cultureDeps.reduce((s, d) => s + d.montant, 0)
    const totalRecs = cultureRecs.reduce((s, r) => s + r.montant, 0)
    const solde = totalRecs - totalDeps

    const associatedClients = cultureClients
      .filter(cc => cc.culture_id === culture.id)
      .map(cc => clients.find(c => c.id === cc.client_id))
      .filter((c): c is Client => c !== undefined)

    return (
      <Dialog>
        <DialogTrigger asChild>
          {variant === 'en_cours' ? (
            <button className="flex min-w-[150px] flex-col gap-2 rounded-2xl bg-gradient-to-br from-[#2d4a2d] to-[#3d6a3d] p-4 text-white shadow-sm transition-all active:scale-95 hover:from-[#3d5a3d]">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Sprout className="h-4 w-4 text-white" />
                </div>
                <span className="rounded-full bg-green-300/30 px-2 py-0.5 text-[10px] font-semibold text-green-100">
                  En cours
                </span>
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{culture.nom}</p>
                {culture.variete && <p className="text-xs text-white/70">{culture.variete}</p>}
              </div>
              <div className="flex items-center justify-between">
                {culture.date_plantation && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-white/60" />
                    <span className="text-[11px] text-white/80">{getDaysLabel(culture.date_plantation)}</span>
                  </div>
                )}
                {culture.date_recolte_prevue && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-white/60" />
                    <span className="text-[11px] text-white/80">{getHarvestLabel(culture.date_recolte_prevue)}</span>
                  </div>
                )}
              </div>
              {culture.surface && <p className="text-[10px] text-white/50">{culture.surface}</p>}
            </button>
          ) : (
            <button className="flex min-w-[140px] flex-col gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-4 transition-all active:scale-95 hover:bg-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Récolté
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{culture.nom}</p>
                {culture.variete && <p className="text-xs text-muted-foreground">{culture.variete}</p>}
              </div>
              <div className={`text-xs font-semibold mt-1 ${solde >= 0 ? 'text-[#2d4a2d]' : 'text-red-500'}`}>
                {solde >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(solde)} F
              </div>
            </button>
          )}
        </DialogTrigger>

        {/* Modal détail */}
        <DialogContent className="sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d4a2d]/10">
                <Sprout className="h-4 w-4 text-[#2d4a2d]" />
              </div>
              <span>{culture.nom}</span>
              {culture.variete && (
                <span className="text-sm font-normal text-muted-foreground">({culture.variete})</span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Solde net */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/50 p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Bénéfice net</p>
              <p className={`text-2xl font-bold ${solde >= 0 ? 'text-[#2d4a2d]' : 'text-red-500'}`}>
                {solde >= 0 ? '+' : ''}{formatCurrency(solde)}
              </p>
            </div>

            {/* Résumé dépenses / recettes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-xl border border-red-100 bg-red-50/50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">Dépenses</span>
                </div>
                <span className="text-base font-semibold text-red-600">{formatCurrency(totalDeps)}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-green-100 bg-green-50/50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="h-3 w-3 text-[#2d4a2d]" />
                  </div>
                  <span className="text-xs text-muted-foreground">Recettes</span>
                </div>
                <span className="text-base font-semibold text-[#2d4a2d]">{formatCurrency(totalRecs)}</span>
              </div>
            </div>

            {/* Infos culture */}
            {(culture.date_plantation || culture.date_recolte_prevue || culture.surface) && (
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Infos</p>
                {culture.surface && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Surface</span>
                    <span className="font-medium">{culture.surface}</span>
                  </div>
                )}
                {culture.date_plantation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plantation</span>
                    <span className="font-medium">{formatDate(culture.date_plantation)}</span>
                  </div>
                )}
                {culture.date_recolte_prevue && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Récolte prévue</span>
                    <span className="font-medium">{formatDate(culture.date_recolte_prevue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Clients associés */}
            {associatedClients.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Users className="h-3 w-3" /> Clients associés ({associatedClients.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {associatedClients.map(client => (
                    <span key={client.id} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                      {client.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des dépenses liées */}
            {cultureDeps.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" /> Dépenses liées ({cultureDeps.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {cultureDeps.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl bg-red-50/60 border border-red-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.description || d.categorie}</p>
                        <p className="text-[11px] text-muted-foreground">{d.categorie} · {formatDate(d.created_at)}</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        -{new Intl.NumberFormat('fr-FR').format(d.montant)} F
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des recettes liées */}
            {cultureRecs.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-[#2d4a2d]" /> Recettes liées ({cultureRecs.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {cultureRecs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-green-50/60 border border-green-100 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.description || 'Vente'}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {r.quantite ? `${r.quantite} ${r.unite} · ` : ''}
                          {formatDate(r.created_at)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#2d4a2d]">
                        +{new Intl.NumberFormat('fr-FR').format(r.montant)} F
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aucune transaction */}
            {cultureDeps.length === 0 && cultureRecs.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
                <Wallet className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Aucune transaction liée à cette culture</p>
                <p className="text-xs text-muted-foreground/60">
                  Lors de l'ajout d'une dépense ou recette, sélectionnez «{culture.nom}»
                </p>
              </div>
            )}

            {/* Bouton Clôturer — dans le modal */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => handleCloturer(culture.id)}
                disabled={loadingId === culture.id}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:bg-gray-900/30 p-3 text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800/40 active:scale-95 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {loadingId === culture.id ? 'Clôture en cours...' : 'Clôturer cette culture'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Productions</h2>
        <button onClick={onNavigateToParametres} className="flex items-center gap-1 text-sm font-medium text-[#2d4a2d]">
          Gérer <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* En cours */}
      {enCours.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {enCours.map((culture) => (
            <CultureCard key={culture.id} culture={culture} variant="en_cours" />
          ))}
        </div>
      )}

      {/* Récoltés */}
      {recoltes.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {recoltes.map((culture) => (
            <CultureCard key={culture.id} culture={culture} variant="recolte" />
          ))}
        </div>
      )}

      {/* Card Clôturées */}
      {cloturees.length > 0 && (
        <button
          onClick={() => setShowCloturees(true)}
          className="flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/60 dark:to-gray-900/40 border border-gray-200 dark:border-gray-700 p-4 transition-all hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700/60 dark:hover:to-gray-800/40 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <Archive className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Cultures clôturées</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {cloturees.length} culture{cloturees.length > 1 ? 's' : ''} archivée{cloturees.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-300 dark:bg-gray-600 px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">
              {cloturees.length}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </button>
      )}

      {/* Modal Clôturées */}
      {showCloturees && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-card shadow-xl border border-border overflow-hidden">
            {/* Header modal */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Archive className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Cultures clôturées</h3>
                  <p className="text-xs text-muted-foreground">{cloturees.length} culture{cloturees.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCloturees(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Liste des clôturées */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                {cloturees.map((culture) => {
                  const cultureDeps = depenses.filter((d) => d.culture_id === culture.id)
                  const cultureRecs = recettes.filter((r) => r.culture_id === culture.id)
                  const totalDeps = cultureDeps.reduce((s, d) => s + d.montant, 0)
                  const totalRecs = cultureRecs.reduce((s, r) => s + r.montant, 0)
                  const solde = totalRecs - totalDeps

                  return (
                    <div key={culture.id} className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                      {/* En-tête de la carte */}
                      <div className="flex items-center justify-between p-4 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <Sprout className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{culture.nom}</p>
                            {culture.variete && <p className="text-xs text-muted-foreground">{culture.variete}</p>}
                          </div>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          <Lock className="h-2.5 w-2.5" /> Clôturée
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-0 border-t border-border">
                        <div className="flex flex-col items-center p-3 border-r border-border">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Dépenses</p>
                          <p className="text-xs font-bold text-red-600">{new Intl.NumberFormat('fr-FR').format(totalDeps)} F</p>
                        </div>
                        <div className="flex flex-col items-center p-3 border-r border-border">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Recettes</p>
                          <p className="text-xs font-bold text-[#2d4a2d]">{new Intl.NumberFormat('fr-FR').format(totalRecs)} F</p>
                        </div>
                        <div className="flex flex-col items-center p-3">
                          <p className="text-[10px] text-muted-foreground mb-0.5">Solde</p>
                          <p className={`text-xs font-bold ${solde >= 0 ? 'text-[#2d4a2d]' : 'text-red-500'}`}>
                            {solde >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(solde)} F
                          </p>
                        </div>
                      </div>

                      {/* Bouton Récupérer */}
                      <div className="p-3 pt-2">
                        <button
                          onClick={() => handleRecuperer(culture.id)}
                          disabled={loadingId === culture.id}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20 p-2.5 text-xs font-bold text-[#2d4a2d] transition-all hover:bg-[#2d4a2d]/20 dark:hover:bg-[#2d4a2d]/30 active:scale-95 disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {loadingId === culture.id ? 'Restauration...' : 'Restaurer cette culture'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
