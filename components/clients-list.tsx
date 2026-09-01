'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Client } from '@/lib/types'
import { Users, Plus, Phone, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchClients = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('clients').select('*').order('nom')
    if (data) setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom) return

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('clients').insert({
      nom,
      telephone: telephone || null
    })

    if (!error) {
      setNom('')
      setTelephone('')
      setShowAddForm(false)
      fetchClients()
    }
    setSubmitting(false)
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
    
    const supabase = createClient()
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) {
      fetchClients()
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner className="h-6 w-6 text-[#2d4a2d]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" /> Répertoire Clients
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm font-medium text-[#2d4a2d]"
        >
          {showAddForm ? 'Fermer' : <><Plus className="h-4 w-4" /> Ajouter</>}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddClient} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nom du client *</label>
            <input
              type="text"
              placeholder="Ex: Diallo"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:border-[#2d4a2d]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Téléphone</label>
            <input
              type="tel"
              placeholder="Ex: 77 000 00 00"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:border-[#2d4a2d]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !nom}
            className="mt-2 h-10 w-full rounded-lg bg-[#2d4a2d] text-sm font-bold text-white transition-all hover:bg-[#3d5a3d] disabled:opacity-50"
          >
            {submitting ? <Spinner className="mx-auto h-4 w-4" /> : 'Enregistrer le client'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {clients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucun client enregistré.
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{client.nom}</span>
                {client.telephone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {client.telephone}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteClient(client.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
