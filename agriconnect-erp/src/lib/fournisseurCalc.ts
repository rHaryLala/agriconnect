import type { AchatFournisseur, AchatStatut, Fournisseur, PaiementFournisseur } from "@/types/fournisseur"

export function achatStatut(achat: AchatFournisseur): AchatStatut {
  return achat.montantPaye >= achat.montant ? "regle" : "en_attente"
}

export function sumMontant(achats: AchatFournisseur[]): number {
  return achats.reduce((total, achat) => total + achat.montant, 0)
}

export function sumPaye(achats: AchatFournisseur[]): number {
  return achats.reduce((total, achat) => total + Math.min(achat.montantPaye, achat.montant), 0)
}

export function sumEnAttente(achats: AchatFournisseur[]): number {
  return achats.filter((achat) => achatStatut(achat) === "en_attente").reduce((total, achat) => total + achat.montant, 0)
}

export function achatsOf(achats: AchatFournisseur[], fournisseurId: string): AchatFournisseur[] {
  return achats.filter((achat) => achat.fournisseurId === fournisseurId)
}

export function paiementsOf(paiements: PaiementFournisseur[], fournisseurId: string): PaiementFournisseur[] {
  return paiements.filter((paiement) => paiement.fournisseurId === fournisseurId)
}

export function dernierAchatDate(achats: AchatFournisseur[]): string | undefined {
  return achats.reduce<string | undefined>(
    (latest, achat) => (!latest || achat.date > latest ? achat.date : latest),
    undefined,
  )
}

export function withinYear(achats: AchatFournisseur[], year: number): AchatFournisseur[] {
  const prefix = `${year}-`
  return achats.filter((achat) => achat.date.startsWith(prefix))
}

export interface FournisseurSummary {
  totalAchats: number
  totalPaye: number
  enAttente: number
  nombreAchats: number
  dernierAchat?: string
}

export function summarise(achats: AchatFournisseur[]): FournisseurSummary {
  return {
    totalAchats: sumMontant(achats),
    totalPaye: sumPaye(achats),
    enAttente: sumEnAttente(achats),
    nombreAchats: achats.length,
    dernierAchat: dernierAchatDate(achats),
  }
}

export function summariseByFournisseur(achats: AchatFournisseur[]): Map<string, FournisseurSummary> {
  const grouped = new Map<string, AchatFournisseur[]>()
  for (const achat of achats) {
    const bucket = grouped.get(achat.fournisseurId)
    if (bucket) bucket.push(achat)
    else grouped.set(achat.fournisseurId, [achat])
  }

  const summaries = new Map<string, FournisseurSummary>()
  for (const [fournisseurId, list] of grouped) {
    summaries.set(fournisseurId, summarise(list))
  }
  return summaries
}

export function countActifs(fournisseurs: Fournisseur[]): number {
  return fournisseurs.filter((fournisseur) => fournisseur.statut === "actif").length
}

export function countCategories(fournisseurs: Fournisseur[]): number {
  return new Set(fournisseurs.map((fournisseur) => fournisseur.categorie)).size
}

export function matchesQuery(fournisseur: Fournisseur, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    fournisseur.nom.toLowerCase().includes(needle) ||
    fournisseur.contact.toLowerCase().includes(needle) ||
    fournisseur.produits.some((produit) => produit.toLowerCase().includes(needle))
  )
}
