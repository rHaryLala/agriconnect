import { EGG_CATEGORIES, type PouleEntry, type VacheEntry, type KuroilerEntry, type CultureEntry, type BovinAnimal, type PoulardMouvement, type RizRecolte, type RizVente, type HaricotMouvement } from "@/types/production"
import type { Invoice } from "@/types/invoice"
import { totalOeufs } from "@/lib/eggCalc"

export function inRange(dateIso: string, start: string, end: string): boolean {
  return dateIso >= start && dateIso <= end
}

export interface ProductionRow {
  filiere: string
  indicateur: string
  valeur: number
  unite: string
}

export function buildProductionRows(
  period: { start: string; end: string },
  data: {
    poules: PouleEntry[]
    vaches: VacheEntry[]
    kuroiler: KuroilerEntry[]
    cultures: CultureEntry[]
    bovins: BovinAnimal[]
    poulard: PoulardMouvement[]
    rizRecoltes: RizRecolte[]
    rizVentes: RizVente[]
    haricots: HaricotMouvement[]
  },
  t: (key: string) => string
): ProductionRow[] {
  const { start, end } = period
  const rows: ProductionRow[] = []

  const poulesInRange = data.poules.filter((e) => inRange(e.date, start, end))
  const oeufsTotal = poulesInRange.reduce((sum, e) => sum + totalOeufs(e.production), 0)
  rows.push({ filiere: "Poules pondeuses", indicateur: "Œufs produits", valeur: oeufsTotal, unite: "unités" })
  for (const cat of EGG_CATEGORIES) {
    const catTotal = poulesInRange.reduce((sum, e) => sum + e.production[cat], 0)
    rows.push({ filiere: "Poules pondeuses", indicateur: `Œufs — ${t(`production.poules.eggCategories.${cat}`)}`, valeur: catTotal, unite: "unités" })
  }
  rows.push({ filiere: "Poules pondeuses", indicateur: "Mortalité", valeur: poulesInRange.reduce((s, e) => s + e.mortalite, 0), unite: "têtes" })

  const vachesInRange = data.vaches.filter((e) => inRange(e.date, start, end))
  const laitTotal = vachesInRange.reduce((sum, e) => sum + e.traites.reduce((s, t) => s + t.matin + t.soir, 0), 0)
  rows.push({ filiere: "Vaches laitières", indicateur: "Lait produit", valeur: laitTotal, unite: "litres" })

  const kuroilerInRange = data.kuroiler.filter((e) => inRange(e.date, start, end))
  rows.push({ filiere: "Poules Kuroiler", indicateur: "Viande produite", valeur: kuroilerInRange.reduce((s, e) => s + e.kgViande, 0), unite: "kg" })
  rows.push({ filiere: "Poules Kuroiler", indicateur: "Poussins vendus", valeur: kuroilerInRange.reduce((s, e) => s + e.poussinsVendus, 0), unite: "unités" })
  rows.push({ filiere: "Poules Kuroiler", indicateur: "Œufs produits", valeur: kuroilerInRange.reduce((s, e) => s + e.oeufsProduits, 0), unite: "unités" })

  const cultureNames = Array.from(new Set(data.cultures.map((c) => c.culture)))
  for (const nom of cultureNames) {
    const entries = data.cultures.filter((c) => c.culture === nom && inRange(c.date, start, end))
    if (entries.length === 0) continue
    const recolte = entries.reduce((s, c) => s + c.recolteQty, 0)
    const surface = entries.reduce((s, c) => s + c.surfaceHa, 0)
    rows.push({ filiere: `Agriculture — ${nom}`, indicateur: "Récolte", valeur: recolte, unite: "kg" })
    rows.push({ filiere: `Agriculture — ${nom}`, indicateur: "Surface", valeur: surface, unite: "ha" })
  }

  const bovinsVentes = data.bovins.filter((a) => a.typeSortie === "vente" && a.dateSortie && inRange(a.dateSortie, start, end))
  rows.push({ filiere: "Bovins", indicateur: "Animaux vendus", valeur: bovinsVentes.length, unite: "têtes" })
  rows.push({ filiere: "Bovins", indicateur: "Valeur des ventes", valeur: bovinsVentes.reduce((s, a) => s + (a.prixVente ?? 0), 0), unite: "Ar" })
  const bovinsDeces = data.bovins.filter((a) => a.typeSortie === "deces" && a.dateSortie && inRange(a.dateSortie, start, end))
  rows.push({ filiere: "Bovins", indicateur: "Décès", valeur: bovinsDeces.length, unite: "têtes" })

  const poulardInRange = data.poulard.filter((m) => inRange(m.date, start, end))
  rows.push({ filiere: "Poulard", indicateur: "Entrées", valeur: poulardInRange.filter((m) => m.type === "entree").reduce((s, m) => s + m.quantite, 0), unite: "têtes" })
  rows.push({ filiere: "Poulard", indicateur: "Ventes", valeur: poulardInRange.filter((m) => m.type === "vente").reduce((s, m) => s + m.quantite, 0), unite: "têtes" })
  rows.push({ filiere: "Poulard", indicateur: "Mortalité", valeur: poulardInRange.filter((m) => m.type === "mortalite").reduce((s, m) => s + m.quantite, 0), unite: "têtes" })

  const rizRecoltesInRange = data.rizRecoltes.filter((r) => inRange(r.date, start, end))
  rows.push({ filiere: "Riz / Paddy", indicateur: "Paddy récolté", valeur: rizRecoltesInRange.reduce((s, r) => s + r.quantiteKg, 0), unite: "kg" })
  const rizVentesInRange = data.rizVentes.filter((v) => inRange(v.date, start, end))
  rows.push({ filiere: "Riz / Paddy", indicateur: "Riz décortiqué vendu", valeur: rizVentesInRange.reduce((s, v) => s + v.quantiteKg, 0), unite: "kg" })
  rows.push({ filiere: "Riz / Paddy", indicateur: "Valeur des ventes", valeur: rizVentesInRange.reduce((s, v) => s + v.quantiteKg * v.prixUnitaire, 0), unite: "Ar" })

  for (const variante of ["blanc", "rouge"] as const) {
    const mvts = data.haricots.filter((m) => m.variante === variante && inRange(m.date, start, end))
    const ventes = mvts.filter((m) => m.type === "vente")
    const label = variante === "blanc" ? "Haricot Blanc" : "Haricot Rouge"
    rows.push({ filiere: `Haricots secs — ${label}`, indicateur: "Vendu", valeur: ventes.reduce((s, m) => s + m.quantiteKg, 0), unite: "kg" })
    rows.push({ filiere: `Haricots secs — ${label}`, indicateur: "Valeur des ventes", valeur: ventes.reduce((s, m) => s + m.quantiteKg * (m.prixUnitaire ?? 0), 0), unite: "Ar" })
  }

  return rows
}

export interface RendementRow {
  article: string
  recolte: number
  unite: string
  surfaceHa: number
  rendement: number | null
}

function pushRendement(rows: RendementRow[], article: string, recolte: number, unite: string, surfaceHa: number) {
  if (recolte === 0 && surfaceHa === 0) return
  rows.push({ article, recolte, unite, surfaceHa, rendement: surfaceHa > 0 ? recolte / surfaceHa : null })
}

export function buildRendementRows(
  period: { start: string; end: string },
  data: {
    cultures: CultureEntry[]
    rizRecoltes: RizRecolte[]
    haricots: HaricotMouvement[]
    customTypes: { label: string; entries: { date: string; quantite: number; unite: string }[] }[]
  }
): RendementRow[] {
  const { start, end } = period
  const rows: RendementRow[] = []

  const cultureNames = [...new Set(data.cultures.map((c) => c.culture))]
  for (const nom of cultureNames) {
    const entries = data.cultures.filter((c) => c.culture === nom && inRange(c.date, start, end))
    pushRendement(
      rows,
      nom,
      entries.reduce((sum, c) => sum + c.recolteQty, 0),
      "kg",
      entries.reduce((sum, c) => sum + c.surfaceHa, 0)
    )
  }

  const paddy = data.rizRecoltes.filter((r) => inRange(r.date, start, end))
  pushRendement(rows, "Paddy", paddy.reduce((sum, r) => sum + r.quantiteKg, 0), "kg", 0)

  const variantes = [...new Set(data.haricots.map((m) => m.variante))]
  for (const variante of variantes) {
    const recoltes = data.haricots.filter((m) => m.variante === variante && m.type === "entree" && inRange(m.date, start, end))
    pushRendement(rows, `Haricot ${variante}`, recoltes.reduce((sum, m) => sum + m.quantiteKg, 0), "kg", 0)
  }

  for (const type of data.customTypes) {
    const entries = type.entries.filter((e) => inRange(e.date, start, end))
    if (entries.length === 0) continue
    pushRendement(rows, type.label, entries.reduce((sum, e) => sum + e.quantite, 0), entries[0].unite, 0)
  }

  return rows.sort((a, b) => b.recolte - a.recolte)
}

export interface MonthlyRecapRow {
  filiere: string
  quantiteVendue: number
  unite: string
  montant: number
}

export function buildMonthlyRecapRows(
  period: { start: string; end: string },
  data: {
    eggSalesValue: { quantite: number; montant: number }
    bovins: BovinAnimal[]
    poulard: PoulardMouvement[]
    rizVentes: RizVente[]
    haricots: HaricotMouvement[]
  }
): MonthlyRecapRow[] {
  const { start, end } = period
  const rows: MonthlyRecapRow[] = []

  rows.push({ filiere: "Œufs", quantiteVendue: data.eggSalesValue.quantite, unite: "unités", montant: data.eggSalesValue.montant })

  const bovinsVentes = data.bovins.filter((a) => a.typeSortie === "vente" && a.dateSortie && inRange(a.dateSortie, start, end))
  rows.push({ filiere: "Bovins", quantiteVendue: bovinsVentes.length, unite: "têtes", montant: bovinsVentes.reduce((s, a) => s + (a.prixVente ?? 0), 0) })

  const poulardVentes = data.poulard.filter((m) => m.type === "vente" && inRange(m.date, start, end))
  rows.push({ filiere: "Poulard", quantiteVendue: poulardVentes.reduce((s, m) => s + m.quantite, 0), unite: "têtes", montant: poulardVentes.reduce((s, m) => s + m.quantite * (m.prixUnitaire ?? 0), 0) })

  const rizVentes = data.rizVentes.filter((v) => inRange(v.date, start, end))
  rows.push({ filiere: "Riz décortiqué", quantiteVendue: rizVentes.reduce((s, v) => s + v.quantiteKg, 0), unite: "kg", montant: rizVentes.reduce((s, v) => s + v.quantiteKg * v.prixUnitaire, 0) })

  const haricotVentes = data.haricots.filter((m) => m.type === "vente" && inRange(m.date, start, end))
  rows.push({ filiere: "Haricots secs", quantiteVendue: haricotVentes.reduce((s, m) => s + m.quantiteKg, 0), unite: "kg", montant: haricotVentes.reduce((s, m) => s + m.quantiteKg * (m.prixUnitaire ?? 0), 0) })

  return rows
}

export interface InvoiceRecap {
  facture: number
  encaisse: number
  restant: number
}

export function computeInvoiceRecap(invoices: Invoice[], start: string, end: string, computeTotal: (inv: Invoice) => number): InvoiceRecap {
  const inRangeInvoices = invoices.filter((inv) => inRange(inv.date, start, end))
  const facture = inRangeInvoices.reduce((s, inv) => s + computeTotal(inv), 0)
  const encaisse = inRangeInvoices.reduce((s, inv) => s + inv.montantPaye, 0)
  return { facture, encaisse, restant: facture - encaisse }
}
