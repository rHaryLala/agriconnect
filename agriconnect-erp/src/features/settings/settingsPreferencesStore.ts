import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationChannel = "email" | "push"
export type NotificationKey =
  | "stockAlerts"
  | "newTransactions"
  | "pendingInvoices"
  | "dailyReport"
  | "unusualLogins"
  | "newUsers"
  | "systemBackup"

type NotificationPrefs = Record<NotificationKey, Record<NotificationChannel, boolean>>

interface SystemBehaviorPrefs {
  autoBackup: boolean
  auditLog: boolean
  maintenanceMode: boolean
  debugMode: boolean
}

interface SettingsPreferencesState {
  notifications: NotificationPrefs
  systemBehavior: SystemBehaviorPrefs
  setNotificationPref: (key: NotificationKey, channel: NotificationChannel, value: boolean) => void
  setSystemBehaviorPref: (key: keyof SystemBehaviorPrefs, value: boolean) => void
}

const defaultNotifications: NotificationPrefs = {
  stockAlerts: { email: true, push: true },
  newTransactions: { email: true, push: false },
  pendingInvoices: { email: true, push: true },
  dailyReport: { email: true, push: false },
  unusualLogins: { email: true, push: true },
  newUsers: { email: false, push: false },
  systemBackup: { email: true, push: false },
}

export const useSettingsPreferencesStore = create<SettingsPreferencesState>()(
  persist(
    (set, get) => ({
      notifications: defaultNotifications,
      systemBehavior: { autoBackup: true, auditLog: true, maintenanceMode: false, debugMode: false },

      setNotificationPref: (key, channel, value) =>
        set({
          notifications: {
            ...get().notifications,
            [key]: { ...get().notifications[key], [channel]: value },
          },
        }),

      setSystemBehaviorPref: (key, value) =>
        set({ systemBehavior: { ...get().systemBehavior, [key]: value } }),
    }),
    { name: "agriconnect-settings-preferences" }
  )
)
