'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sprout, Check } from 'lucide-react'
import { Culture } from '@/lib/types'

interface CultureFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CultureForm({ onSuccess, onCancel }: CultureFormProps) {
  const [nom, setNom] = useState('')
  const [variete, setVariete] = useState('')
  const [surface, setSurface] = useState('')
  const [datePlantation, setDatePlantation] = useState('')
  const [dateRecoltePrevue, setDateRecoltePrevue] = useState('')
  const [statut, setStatut] = useState<'en_cours' | 'recolte'>('en_cours')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom) return

    const newCulture: Culture = {
      id: Math.random().toString(36).substr(2, 9),
      nom,
      variete: variete || null,
      surface: surface || null,
      date_plantation: datePlantation || null,
      date_recolte_prevue: dateRecoltePrevue || null,
      statut,
      notes: null,
      created_at: new Date().toISOString()
    }

    const existing = localStorage.getItem('farm_cultures')
    const cultures = existing ? JSON.parse(existing) : []
    localStorage.setItem('farm_cultures', JSON.stringify([newCulture, ...cultures]))
    
    onSuccess()
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2d4a2d]/10">
          <Sprout className="h-10 w-10 text-[#2d4a2d]" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Ajouter une nouvelle culture
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-4 pb-6">
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Nom de la culture</Label>
          <Input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex: Tomate, Maïs..."
            className="h-14 rounded-xl border-border bg-gray-50 text-base"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Variété (optionnel)</Label>
          <Input
            value={variete}
            onChange={(e) => setVariete(e.target.value)}
            placeholder="Ex: Roma, F1..."
            className="h-14 rounded-xl border-border bg-gray-50 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Surface (optionnel)</Label>
          <Input
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            placeholder="Ex: 2 hectares, 500m2..."
            className="h-14 rounded-xl border-border bg-gray-50 text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Date plantation</Label>
            <Input
              type="date"
              value={datePlantation}
              onChange={(e) => setDatePlantation(e.target.value)}
              className="h-14 rounded-xl border-border bg-gray-50 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Récolte prévue</Label>
            <Input
              type="date"
              value={dateRecoltePrevue}
              onChange={(e) => setDateRecoltePrevue(e.target.value)}
              className="h-14 rounded-xl border-border bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Statut</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatut('en_cours')}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                statut === 'en_cours' 
                  ? 'border-[#2d4a2d] bg-[#2d4a2d]/10 text-[#2d4a2d]' 
                  : 'border-border bg-transparent text-muted-foreground'
              }`}
            >
              En cours
            </button>
            <button
              type="button"
              onClick={() => setStatut('recolte')}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                statut === 'recolte' 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-border bg-transparent text-muted-foreground'
              }`}
            >
              Récolté
            </button>
          </div>
        </div>

        <div className="mt-auto flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 flex-1 rounded-xl text-base"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!nom}
            className="h-14 flex-1 rounded-xl bg-[#2d4a2d] text-base font-semibold text-white hover:bg-[#3d5a3d]"
          >
            <Check className="mr-2 h-5 w-5" />
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}
