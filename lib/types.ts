export interface Depense {
  id: string
  montant: number
  categorie: string
  description: string | null
  culture_id: string | null
  created_at: string
}

export interface Recette {
  id: string
  montant: number
  description: string | null
  quantite: number | null
  unite: string | null
  culture_id: string | null
  created_at: string
}

export interface Culture {
  id: string
  nom: string
  variete: string | null
  surface: string | null
  date_plantation: string | null
  date_recolte_prevue: string | null
  statut: 'en_cours' | 'recolte'
  notes: string | null
  created_at: string
}

export const UNITES_VENTE = [
  'Sacs',
  'Kg',
  'Tonnes',
  'Unités',
  'Litres',
  'Bottes',
  'Caisses',
  'Autre'
] as const

export type UniteVente = typeof UNITES_VENTE[number]

export const CATEGORIES_DEPENSES = [
  'Transport',
  'Semences',
  'Main d\'oeuvre',
  'Nourriture animaux',
  'Engrais',
  'Pesticides',
  'Équipement',
  'Carburant',
  'Eau/Irrigation',
  'Autre'
] as const

export type CategorieDepense = typeof CATEGORIES_DEPENSES[number]
