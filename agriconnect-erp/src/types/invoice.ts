export type PaymentMethod = "comptant" | "commande" | "salaire"

export interface InvoiceLineItem {
  articleId: string
  quantite: number
  prixUnitaire: number
}

export interface Invoice {
  id: string
  numero: string
  clientId: string
  date: string
  paymentMethod: PaymentMethod
  items: InvoiceLineItem[]
  montantPaye: number
}

export function computeInvoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0)
}

export function computeInvoiceDue(invoice: Invoice): number {
  return computeInvoiceTotal(invoice) - invoice.montantPaye
}

export type InvoiceStatus = "payee" | "partielle" | "impayee" | "a_prelever"

export function computeInvoiceStatus(invoice: Invoice): InvoiceStatus {
  const due = computeInvoiceDue(invoice)
  if (invoice.paymentMethod === "salaire" && invoice.montantPaye === 0) return "a_prelever"
  if (due <= 0) return "payee"
  if (invoice.montantPaye > 0) return "partielle"
  return "impayee"
}