import { useEffect } from "react"
import { computeInvoiceDue } from "@/types/invoice"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { useStockStore } from "@/features/stocks/stockStore"
import { useInvoicesStore } from "@/features/clients/invoicesStore"
import { useFournisseursStore } from "@/features/fournisseurs/fournisseursStore"

export function useNavBadges(): Record<string, number> {
  const { articles, movements, fetchAll: fetchStock } = useStockStore()
  const { invoices, fetchAll: fetchInvoices } = useInvoicesStore()
  const { achats, fetchAll: fetchFournisseurs } = useFournisseursStore()

  useEffect(() => {
    fetchStock()
    fetchInvoices()
    fetchFournisseurs()
  }, [fetchStock, fetchInvoices, fetchFournisseurs])

  const alerteStock = articles.filter(
    (article) => getStockStatus(computeCurrentStock(article, movements), article.seuilCritique) === "critique",
  ).length

  const facturesImpayees = invoices.filter((invoice) => computeInvoiceDue(invoice) > 0).length
  const achatsEnAttente = achats.filter((achat) => achat.montantPaye < achat.montant).length

  return {
    "/app/stocks": alerteStock,
    "/app/clients": facturesImpayees,
    "/app/fournisseurs": achatsEnAttente,
  }
}
