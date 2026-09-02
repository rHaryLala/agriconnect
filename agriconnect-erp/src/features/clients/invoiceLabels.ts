import type { PaymentMethod } from "@/types/invoice"
import type { InvoiceStatus } from "@/types/invoice"

export const PAYMENT_METHOD_LABEL_KEYS: Record<PaymentMethod, string> = {
  comptant: "clients.invoices.paymentComptant",
  commande: "clients.invoices.paymentCommande",
  salaire: "clients.invoices.paymentSalaire",
}

export const INVOICE_STATUS_LABEL_KEYS: Record<InvoiceStatus, string> = {
  payee: "clients.invoices.statusPaid",
  partielle: "clients.invoices.statusPartial",
  impayee: "clients.invoices.statusUnpaid",
  a_prelever: "clients.invoices.statusPayroll",
}

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, "success" | "warning" | "destructive" | "info"> = {
  payee: "success",
  partielle: "warning",
  impayee: "destructive",
  a_prelever: "info",
}