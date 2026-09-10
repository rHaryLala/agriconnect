import { create } from "zustand"
import type { Invoice } from "@/types/invoice"

const FAKE_LATENCY_MS = 500
const SEED_INVOICES: Invoice[] = []

function nextNumero(existing: Invoice[]): string {
  const year = new Date().getFullYear()
  const count = existing.length + 1
  return `FA-${year}-${String(count).padStart(4, "0")}`
}

interface InvoicesState {
  invoices: Invoice[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addInvoice: (data: Omit<Invoice, "id" | "numero">) => Promise<Invoice>
  recordPayment: (id: string, amount: number) => Promise<void>
  deleteInvoice: (id: string) => void
}

export const useInvoicesStore = create<InvoicesState>((set, get) => ({
  invoices: [],
  isLoading: false,

  fetchAll: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ invoices: SEED_INVOICES, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addInvoice: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const invoices = get().invoices
        const invoice: Invoice = { ...data, id: `inv-${Date.now()}`, numero: nextNumero(invoices) }
        set({ invoices: [invoice, ...invoices] })
        resolve(invoice)
      }, FAKE_LATENCY_MS)
    }),

  recordPayment: (id, amount) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({
          invoices: get().invoices.map((inv) =>
            inv.id === id ? { ...inv, montantPaye: inv.montantPaye + amount } : inv
          ),
        })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteInvoice: (id) => set({ invoices: get().invoices.filter((inv) => inv.id !== id) }),
}))