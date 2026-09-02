import { create } from "zustand"
import type { Invoice } from "@/types/invoice"

const FAKE_LATENCY_MS = 500

const SEED_INVOICES: Invoice[] = [
  { id: "inv-1", numero: "FAC-2026-0001", clientId: "cl-1", date: "2026-08-10", paymentMethod: "comptant", items: [{ articleId: "a-oeufs", quantite: 60, prixUnitaire: 1200 }], montantPaye: 72_000 },
  { id: "inv-2", numero: "FAC-2026-0002", clientId: "cl-4", date: "2026-08-12", paymentMethod: "commande", items: [{ articleId: "a-lait", quantite: 40, prixUnitaire: 1500 }], montantPaye: 30_000 },
  { id: "inv-3", numero: "FAC-2026-0003", clientId: "cl-3", date: "2026-08-14", paymentMethod: "salaire", items: [{ articleId: "a-oeufs", quantite: 20, prixUnitaire: 1200 }], montantPaye: 0 },
]

interface InvoicesState {
  invoices: Invoice[]
  isLoading: boolean
  fetchAll: () => Promise<void>
  addInvoice: (data: Omit<Invoice, "id" | "numero">) => Promise<void>
  recordPayment: (id: string, amount: number) => Promise<void>
  deleteInvoice: (id: string) => void
}

function generateNumero(existing: Invoice[]): string {
  const year = new Date().getFullYear()
  const next = existing.length + 1
  return `FAC-${year}-${String(next).padStart(4, "0")}`
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
        const numero = generateNumero(get().invoices)
        set({ invoices: [{ ...data, id: `inv-${Date.now()}`, numero }, ...get().invoices] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  recordPayment: (id, amount) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ invoices: get().invoices.map((inv) => (inv.id === id ? { ...inv, montantPaye: inv.montantPaye + amount } : inv)) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteInvoice: (id) => set({ invoices: get().invoices.filter((inv) => inv.id !== id) }),
}))