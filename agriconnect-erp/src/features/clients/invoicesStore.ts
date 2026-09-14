import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Invoice } from "@/types/invoice"

const FAKE_LATENCY_MS = 500
const SEED_INVOICES: Invoice[] = [
  {
    id: "inv-seed-1",
    numero: "FA-2026-0001",
    clientId: "cl-3",
    date: "2026-09-02",
    paymentMethod: "salaire",
    items: [{ libelle: "Riz décortiqué", quantite: 25, prixUnitaire: 3_200 }],
    montantPaye: 0,
  },
  {
    id: "inv-seed-2",
    numero: "FA-2026-0002",
    clientId: "cl-3",
    date: "2026-09-06",
    paymentMethod: "salaire",
    items: [{ libelle: "Haricot blanc", quantite: 10, prixUnitaire: 4_500 }],
    montantPaye: 20_000,
  },
]

/** Local fallback, used until the accounting software issues the real number. */
function nextNumero(existing: Invoice[]): string {
  const year = new Date().getFullYear()
  const count = existing.length + 1
  return `FA-${year}-${String(count).padStart(4, "0")}`
}

interface InvoicesState {
  invoices: Invoice[]
  isLoading: boolean
  hasFetched: boolean
  fetchAll: () => Promise<void>
  addInvoice: (data: Omit<Invoice, "id" | "numero">) => Promise<Invoice>
  recordPayment: (id: string, amount: number) => Promise<void>
  deleteInvoice: (id: string) => void
}

export const useInvoicesStore = create<InvoicesState>()(
  persist(
    (set, get) => ({
      invoices: [],
      isLoading: false,
      hasFetched: false,

      fetchAll: () => {
        if (get().hasFetched) return Promise.resolve()
        return new Promise((resolve) => {
          set({ isLoading: true })
          setTimeout(() => {
            set({ invoices: SEED_INVOICES, isLoading: false, hasFetched: true })
            resolve()
          }, FAKE_LATENCY_MS)
        })
      },

      addInvoice: (data) =>
        new Promise((resolve) => {
          setTimeout(() => {
            const invoices = get().invoices
            const numeroComptabilite = data.numeroComptabilite?.trim()
            const invoice: Invoice = {
              ...data,
              numeroComptabilite: numeroComptabilite || undefined,
              id: `inv-${Date.now()}`,
              numero: nextNumero(invoices),
            }
            set({ invoices: [invoice, ...invoices], hasFetched: true })
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
    }),
    {
      name: "agriconnect-invoices",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ invoices: state.invoices, hasFetched: state.hasFetched }),
    }
  )
)
