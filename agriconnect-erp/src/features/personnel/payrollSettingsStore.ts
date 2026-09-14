import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Payroll is prepared on a date that moves from month to month — in practice
 * somewhere between the 17th and the 23rd — so the window is configurable.
 */
interface PayrollSettingsState {
  jourDebut: number
  jourFin: number
  setWindow: (jourDebut: number, jourFin: number) => void
}

export const DEFAULT_PAYROLL_WINDOW = { jourDebut: 17, jourFin: 23 }

export const usePayrollSettingsStore = create<PayrollSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PAYROLL_WINDOW,
      setWindow: (jourDebut, jourFin) =>
        set({
          jourDebut: Math.min(Math.max(1, jourDebut), 28),
          jourFin: Math.min(Math.max(jourDebut, jourFin), 28),
        }),
    }),
    { name: "agriconnect-payroll-settings" }
  )
)
