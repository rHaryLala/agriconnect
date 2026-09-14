import { computeInvoiceDue, computeInvoiceTotal, type Invoice } from "@/types/invoice"
import type { Employe } from "@/types/personnel"

export type RetenueStatut = "en_attente" | "regularise"

export interface RetenueLine {
  invoiceId: string
  numero: string
  employeId: string
  date: string
  produit: string
  montant: number
  montantRegle: number
  reste: number
  statut: RetenueStatut
}

/** Payroll preparation window of the month containing `anchorIso`. */
export function payrollWindow(anchorIso: string, jourDebut: number, jourFin: number): { start: string; end: string } {
  const mois = anchorIso.slice(0, 7)
  const pad = (day: number) => String(day).padStart(2, "0")
  return { start: `${mois}-${pad(jourDebut)}`, end: `${mois}-${pad(jourFin)}` }
}

/** Product bought, read from the invoice lines. */
export function describeInvoice(invoice: Invoice, articleName: (id: string) => string | undefined): string {
  const labels = invoice.items.map((item) => item.libelle ?? (item.articleId ? articleName(item.articleId) : undefined)).filter(Boolean)
  return [...new Set(labels)].join(", ")
}

/**
 * Payroll deductions owed by staff, derived from the sales they paid with the
 * "retenue sur salaire" method. A deduction is outstanding until the invoice is
 * settled.
 */
export function buildRetenues(
  invoices: Invoice[],
  employes: Employe[],
  articleName: (id: string) => string | undefined
): RetenueLine[] {
  const byClient = new Map(employes.filter((e) => e.clientId).map((e) => [e.clientId as string, e]))
  return invoices
    .filter((invoice) => invoice.paymentMethod === "salaire" && byClient.has(invoice.clientId))
    .map((invoice) => ({
      invoiceId: invoice.id,
      numero: invoice.numero,
      employeId: (byClient.get(invoice.clientId) as Employe).id,
      date: invoice.date,
      produit: describeInvoice(invoice, articleName),
      montant: computeInvoiceTotal(invoice),
      montantRegle: invoice.montantPaye,
      reste: computeInvoiceDue(invoice),
      statut: computeInvoiceDue(invoice) > 0 ? ("en_attente" as const) : ("regularise" as const),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function retenuesEnAttente(lines: RetenueLine[]): RetenueLine[] {
  return lines.filter((line) => line.statut === "en_attente")
}

export function retenuesRegularisees(lines: RetenueLine[]): RetenueLine[] {
  return lines.filter((line) => line.statut === "regularise")
}

export function totalRestant(lines: RetenueLine[]): number {
  return lines.reduce((sum, line) => sum + line.reste, 0)
}

export interface EmployeRetenues {
  employe: Employe
  lines: RetenueLine[]
  reste: number
}

/** Outstanding deductions grouped per employee, largest balance first. */
export function retenuesParEmploye(lines: RetenueLine[], employes: Employe[]): EmployeRetenues[] {
  return employes
    .map((employe) => {
      const own = lines.filter((line) => line.employeId === employe.id)
      return { employe, lines: own, reste: totalRestant(own) }
    })
    .filter((entry) => entry.lines.length > 0)
    .sort((a, b) => b.reste - a.reste)
}
