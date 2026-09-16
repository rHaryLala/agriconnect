import { useEffect } from "react"
import { computeInvoiceDue } from "@/types/invoice"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { useStockStore } from "@/features/stocks/stockStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useFournisseursStore } from "@/features/fournisseurs/fournisseursStore"

export type BadgeKey = "stockAlerts" | "unpaidInvoices" | "pendingPurchases"

export function useNavBadges(): Record<BadgeKey, number> {
  const { articles, movements, fetchAll: fetchStock } = useStockStore()
  const { invoices, fetchAll: fetchInvoices } = useInvoicesStore()
  const { achats, fetchAll: fetchFournisseurs } = useFournisseursStore()

  useEffect(() => {
    fetchStock()
    fetchInvoices()
    fetchFournisseurs()
  }, [fetchStock, fetchInvoices, fetchFournisseurs])

  return {
    stockAlerts: articles.filter(
      (article) => getStockStatus(computeCurrentStock(article, movements), article.seuilCritique) === "critique",
    ).length,
    unpaidInvoices: invoices.filter((invoice) => computeInvoiceDue(invoice) > 0).length,
    pendingPurchases: achats.filter((achat) => achat.montantPaye < achat.montant).length,
  }
}
