import { computeInvoiceDue, computeInvoiceTotal, type Invoice } from "@/types/invoice"
import type { Employe } from "@/types/personnel"

export interface RetenueLine {
  invoiceId: string
  numero: string
  employeId: string
  date: string
  produit: string
  montant: number
  montantRegle: number
  reste: number
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
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function retenuesEnAttente(lines: RetenueLine[]): RetenueLine[] {
  return lines.filter((line) => line.reste > 0)
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
