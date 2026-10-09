import { ApiError } from "@/lib/apiClient"
import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"

/**
 * Rapports côté serveur. Le front sait déjà composer et exporter ses tableaux
 * à partir de ses stores ; /reports apporte autre chose : un récapitulatif
 * mensuel consolidé, calculé en base, et son PDF/Excel générés côté serveur.
 *
 * Les deux coexistent au lieu de se remplacer. Les cinq onglets de rapports
 * restent alimentés localement — seul le récapitulatif mensuel a un équivalent
 * serveur. Le repli renvoie `null` : l'appelant reprend alors l'export client,
 * ce qui évite de perdre une fonctionnalité quand le serveur est injoignable.
 */

export interface RapportMensuel {
  mois: string
  periode: { debut: string; fin: string }
  production: { type: string; quantiteTotale: number; nombreSaisies: number }[]
  finance: { totalRecettes: number; totalDepenses: number; benefice: number }
  stock: {
    mouvementParType: { type: string; quantiteTotale: number; nombreMouvements: number }[]
    nombreArticlesEnAlerte: number
  }
  cattle: { nombreVentes: number; montantVentes: number; nombreDeces: number; laitTotalLitres: number }
  poultry: {
    nombreVentes: number
    montantVentes: number
    nombreDecesDirects: number
    mortaliteHebdomadaireCumulee: number
  }
}

/** Le serveur impose le format YYYY-MM : un rapport porte sur un mois entier. */
export function moisDepuisDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function fetchRapportMensuel(token: string, mois: string): Promise<RapportMensuel | null> {
  return withMockFallback(
    "rapports",
    () => apiFetch<RapportMensuel>(`/reports/monthly?month=${encodeURIComponent(mois)}`, { token }),
    async () => null,
  )
}

const API_PREFIX = "/api/v1"
const API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/+$/, "") ?? ""

/**
 * apiFetch suppose une réponse JSON : un PDF ou un XLSX passe donc par ce
 * chemin dédié, avec la même distinction panne / refus du serveur pour que le
 * repli de withMockFallback reste correct.
 */
async function fetchBlob(chemin: string, token: string): Promise<Blob> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${API_PREFIX}${chemin}`, { headers: { Authorization: `Bearer ${token}` } })
  } catch {
    throw new ApiError(0, "Serveur injoignable", true)
  }
  if (!res.ok) throw new ApiError(res.status, `Erreur ${res.status}`)
  return res.blob()
}

export function telechargerRapportPdf(token: string, mois: string): Promise<Blob | null> {
  return withMockFallback(
    "rapports",
    () => fetchBlob(`/reports/monthly/pdf?month=${encodeURIComponent(mois)}`, token),
    async () => null,
  )
}

export function telechargerRapportExcel(token: string, mois: string): Promise<Blob | null> {
  return withMockFallback(
    "rapports",
    () => fetchBlob(`/reports/monthly/excel?month=${encodeURIComponent(mois)}`, token),
    async () => null,
  )
}

/** Déclenche l'enregistrement d'un document déjà récupéré. */
export function enregistrerBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const lien = document.createElement("a")
  lien.href = url
  lien.download = filename
  lien.click()
  URL.revokeObjectURL(url)
}
