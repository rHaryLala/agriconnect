import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import {
  FOURNISSEUR_CATEGORIES,
  type AchatFournisseur,
  type Fournisseur,
  type FournisseurCategorie,
  type PaiementFournisseur,
} from "@/types/fournisseur"
import { SEED_ACHATS, SEED_FOURNISSEURS, SEED_PAIEMENTS } from "./mockFournisseurData"

/**
 * Adaptation fournisseurs. Le backend expose /suppliers en anglais ; le front
 * nomme ses champs en français comme partout ailleurs.
 *
 * Trois écarts de contrat, documentés plutôt que contournés :
 * - `contact` n'existe pas côté backend (seuls phone/email) ;
 * - `category` est une chaîne libre en base, alors que le front a une liste
 *   fermée de six catégories ;
 * - aucune route ne supprime un fournisseur.
 */

interface BackendSupplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  category: string | null
  status: "ACTIF" | "INACTIF"
  rating: number | null
  paymentTermDays: number | null
  products: string[]
}

interface BackendSupplierPayment {
  id: string
  amount: string | number
  method: "CAISSE" | "VIREMENT" | "CHEQUE" | "MOBILE_MONEY"
  date: string
  purchaseId: string
}

interface BackendPurchase {
  id: string
  reference: string
  description: string | null
  totalAmount: string | number
  paidAmount: string | number
  date: string
  status: "EN_ATTENTE" | "PARTIEL" | "REGLE"
  supplierId: string
  supplierPayments?: BackendSupplierPayment[]
}

// CHEQUE n'a pas d'équivalent front : la valeur brute est conservée, l'écran
// affiche le libellé quand il en connaît un et la valeur sinon.
const MOYEN: Record<BackendSupplierPayment["method"], string> = {
  CAISSE: "especes",
  VIREMENT: "virement",
  MOBILE_MONEY: "mobile",
  CHEQUE: "cheque",
}
const MOYEN_VERS_BACK: Record<string, BackendSupplierPayment["method"]> = {
  especes: "CAISSE",
  virement: "VIREMENT",
  mobile: "MOBILE_MONEY",
  cheque: "CHEQUE",
}

const CATEGORIE_PAR_DEFAUT: FournisseurCategorie = "intrants"

/** La catégorie n'est validée qu'ici : en base c'est une chaîne libre. */
function versCategorie(valeur: string | null): FournisseurCategorie {
  const connue = FOURNISSEUR_CATEGORIES.find((c) => c === valeur)
  return connue ?? CATEGORIE_PAR_DEFAUT
}

function jour(iso: string): string {
  return iso.slice(0, 10)
}

function versFournisseurFront(s: BackendSupplier): Fournisseur {
  return {
    id: s.id,
    nom: s.name,
    // Pas de champ `contact` en base : le front affiche une chaîne vide plutôt
    // qu'un nom inventé.
    contact: "",
    telephone: s.phone ?? undefined,
    email: s.email ?? undefined,
    adresse: s.address ?? undefined,
    categorie: versCategorie(s.category),
    produits: s.products,
    note: s.rating ?? 0,
    delaiPaiementJours: s.paymentTermDays ?? 0,
    statut: s.status === "INACTIF" ? "inactif" : "actif",
  }
}

function corpsFournisseur(data: Omit<Fournisseur, "id">) {
  // `statut` et `contact` ne sont pas envoyés : CreateSupplierDto ne les accepte
  // pas, et forbidNonWhitelisted transformerait l'appel en 400.
  return {
    name: data.nom,
    phone: data.telephone || undefined,
    email: data.email || undefined,
    address: data.adresse || undefined,
    category: data.categorie,
    rating: data.note || undefined,
    paymentTermDays: data.delaiPaiementJours || undefined,
    products: data.produits.length > 0 ? data.produits : undefined,
  }
}

function versAchatFront(p: BackendPurchase): AchatFournisseur {
  return {
    id: p.id,
    fournisseurId: p.supplierId,
    reference: p.reference,
    date: jour(p.date),
    description: p.description ?? "",
    // totalAmount et paidAmount sont des Decimal : sérialisés en chaîne.
    montant: Number(p.totalAmount),
    montantPaye: Number(p.paidAmount),
  }
}

function versPaiementFront(pay: BackendSupplierPayment, fournisseurId: string): PaiementFournisseur {
  return {
    id: pay.id,
    fournisseurId,
    achatId: pay.purchaseId,
    date: jour(pay.date),
    montant: Number(pay.amount),
    moyen: MOYEN[pay.method] ?? pay.method,
  }
}

export function fetchFournisseurs(token: string): Promise<{
  fournisseurs: Fournisseur[]
  achats: AchatFournisseur[]
  paiements: PaiementFournisseur[]
}> {
  return withMockFallback(
    "fournisseurs",
    async () => {
      const suppliers = await apiFetch<BackendSupplier[]>("/suppliers", { token })

      // Les achats ne sont exposés que par fournisseur. Un appel par
      // fournisseur, en parallèle ; chacun embarque déjà ses paiements.
      const parFournisseur = await Promise.all(
        suppliers.map((s) => apiFetch<BackendPurchase[]>(`/suppliers/${s.id}/purchases`, { token })),
      )

      const achats: AchatFournisseur[] = []
      const paiements: PaiementFournisseur[] = []
      parFournisseur.flat().forEach((p) => {
        achats.push(versAchatFront(p))
        p.supplierPayments?.forEach((pay) => paiements.push(versPaiementFront(pay, p.supplierId)))
      })

      return { fournisseurs: suppliers.map(versFournisseurFront), achats, paiements }
    },
    async () => ({ fournisseurs: SEED_FOURNISSEURS, achats: SEED_ACHATS, paiements: SEED_PAIEMENTS }),
  )
}

export function createFournisseur(token: string, data: Omit<Fournisseur, "id">): Promise<Fournisseur> {
  return withMockFallback(
    "fournisseurs",
    async () =>
      versFournisseurFront(
        await apiFetch<BackendSupplier>("/suppliers", { method: "POST", token, body: corpsFournisseur(data) }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function updateFournisseur(token: string, id: string, data: Omit<Fournisseur, "id">): Promise<Fournisseur> {
  return withMockFallback(
    "fournisseurs",
    async () =>
      versFournisseurFront(
        await apiFetch<BackendSupplier>(`/suppliers/${id}`, { method: "PATCH", token, body: corpsFournisseur(data) }),
      ),
    async () => ({ ...data, id }),
  )
}

/**
 * La référence est attribuée par le serveur, jamais envoyée : c'est ce qui
 * évite les doublons de numérotation. Celle saisie côté front est ignorée.
 */
export function createAchat(token: string, data: Omit<AchatFournisseur, "id">): Promise<AchatFournisseur> {
  return withMockFallback(
    "fournisseurs",
    async () =>
      versAchatFront(
        await apiFetch<BackendPurchase>(`/suppliers/${data.fournisseurId}/purchases`, {
          method: "POST",
          token,
          body: { description: data.description || undefined, totalAmount: data.montant, date: data.date },
        }),
      ),
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}

export function createPaiement(token: string, data: Omit<PaiementFournisseur, "id">): Promise<PaiementFournisseur> {
  return withMockFallback(
    "fournisseurs",
    async () => {
      // Un paiement se rattache à un achat : sans achatId, le backend n'a pas
      // de route. On laisse l'erreur remonter plutôt que d'en choisir un.
      if (!data.achatId) throw new Error("Un paiement fournisseur doit être rattaché à un achat")
      const pay = await apiFetch<BackendSupplierPayment>(`/suppliers/purchases/${data.achatId}/payments`, {
        method: "POST",
        token,
        body: { amount: data.montant, method: MOYEN_VERS_BACK[data.moyen] ?? "CAISSE", date: data.date },
      })
      return versPaiementFront(pay, data.fournisseurId)
    },
    async () => ({ ...data, id: crypto.randomUUID() }),
  )
}
