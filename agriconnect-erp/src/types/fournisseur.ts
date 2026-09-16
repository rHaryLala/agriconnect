export type FournisseurStatut = "actif" | "inactif"

export const FOURNISSEUR_STATUTS: FournisseurStatut[] = ["actif", "inactif"]

export type FournisseurCategorie =
  | "aliments"
  | "veterinaire"
  | "intrants"
  | "carburant"
  | "materiel"
  | "transport"

export const FOURNISSEUR_CATEGORIES: FournisseurCategorie[] = [
  "aliments",
  "veterinaire",
  "intrants",
  "carburant",
  "materiel",
  "transport",
]

export interface Fournisseur {
  id: string
  nom: string
  contact: string
  telephone?: string
  email?: string
  adresse?: string
  categorie: FournisseurCategorie
  produits: string[]
  note: number
  delaiPaiementJours: number
  statut: FournisseurStatut
}

export interface AchatFournisseur {
  id: string
  fournisseurId: string
  reference: string
  date: string
  description: string
  montant: number
  montantPaye: number
}

export interface PaiementFournisseur {
  id: string
  fournisseurId: string
  achatId?: string
  date: string
  montant: number
  moyen: string
  reference?: string
}

export type AchatStatut = "regle" | "en_attente"
