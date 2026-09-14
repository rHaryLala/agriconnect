import type { EggCategory } from "./production"

export type PaymentMethod = "comptant" | "commande" | "salaire"

export interface InvoiceLineItem {
  articleId?: string
  eggCategory?: EggCategory
  bovinId?: string
  /** Product name, for lines that do not point at a stock article. */
  libelle?: string
  quantite: number
  prixUnitaire: number
}

export interface Invoice {
  id: string
  /** Provisional number generated locally when no accounting number is known. */
  numero: string
  /**
   * Receipt number issued by the accounting software at the office. When it is
   * filled in, it is the number that is shown and printed.
   */
  numeroComptabilite?: string
  clientId: string
  date: string
  paymentMethod: PaymentMethod
  items: InvoiceLineItem[]
  montantPaye: number
}

/** Receipt number to display: the accounting one when known, the local one otherwise. */
export function invoiceReceiptNumber(invoice: Invoice): string {
  return invoice.numeroComptabilite?.trim() || invoice.numero
}

export function hasAccountingReceipt(invoice: Invoice): boolean {
  return !!invoice.numeroComptabilite?.trim()
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