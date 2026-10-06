import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import { MOCK_DASHBOARD_DATA } from "./mockDashboardData"

/** Réponse du backend : clés françaises, périmètre volontairement étroit. */
interface BackendDashboard {
  date: string
  productionDuJour: { type: string; quantite: number }[]
  stockCritique: { id: string; nom: string; quantiteActuelle: number; seuil: number }[]
  soldeCaisse: number
  indicateurs: { nombreAlertesStock: number; nombreTypesProduitsAujourdhui: number }
}

export type DashboardData = typeof MOCK_DASHBOARD_DATA & {
  /** Articles sous leur seuil, liste réelle quand le serveur répond. */
  stockCritique: BackendDashboard["stockCritique"]
  /** Chiffres effectivement renvoyés par le serveur, pour les distinguer des valeurs de démonstration. */
  champsReels: string[]
}

/**
 * Le contrôleur /dashboard ne couvre qu'une partie des indicateurs affichés :
 * solde de caisse, nombre d'alertes stock et production du jour. Le reste
 * (récolte du mois, total d'articles, recettes/dépenses, clients) n'a pas
 * d'équivalent. On superpose donc le réel sur les valeurs de démonstration
 * plutôt que de laisser des cases vides.
 */
function adapter(payload: BackendDashboard): DashboardData {
  const quantiteDuJour = payload.productionDuJour.reduce((total, p) => total + p.quantite, 0)

  return {
    ...MOCK_DASHBOARD_DATA,
    production: { ...MOCK_DASHBOARD_DATA.production, harvestThisMonth: quantiteDuJour },
    stock: { ...MOCK_DASHBOARD_DATA.stock, lowStockAlerts: payload.indicateurs.nombreAlertesStock },
    finance: { ...MOCK_DASHBOARD_DATA.finance, margin: payload.soldeCaisse },
    stockCritique: payload.stockCritique,
    champsReels: ["production.harvestThisMonth", "stock.lowStockAlerts", "finance.margin", "stockCritique"],
  }
}

const MOCK: DashboardData = { ...MOCK_DASHBOARD_DATA, stockCritique: [], champsReels: [] }

export function fetchDashboard(token: string): Promise<DashboardData> {
  return withMockFallback(
    "dashboard",
    async () => adapter(await apiFetch<BackendDashboard>("/dashboard", { token })),
    async () => MOCK,
  )
}
