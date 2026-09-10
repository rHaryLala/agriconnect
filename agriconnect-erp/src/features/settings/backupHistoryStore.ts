import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type BackupType = "automatique" | "manuelle"
export type BackupStatus = "succes" | "erreur"

export interface BackupEntry {
  id: string
  dateIso: string
  sizeKb: number
  type: BackupType
  durationSeconds: number | null
  status: BackupStatus
}

function seedHistory(): BackupEntry[] {
  const day = 86_400_000
  const now = Date.now()
  const at = (daysAgo: number, hour: number, minute = 0) => {
    const d = new Date(now - daysAgo * day)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }
  return [
    { id: "b-1", dateIso: at(0, 2), sizeKb: 48.2, type: "automatique", durationSeconds: 134, status: "succes" },
    { id: "b-2", dateIso: at(1, 2), sizeKb: 47.8, type: "automatique", durationSeconds: 128, status: "succes" },
    { id: "b-3", dateIso: at(2, 2), sizeKb: 47.1, type: "automatique", durationSeconds: 122, status: "succes" },
    { id: "b-4", dateIso: at(3, 14, 30), sizeKb: 46.9, type: "manuelle", durationSeconds: 118, status: "succes" },
    { id: "b-5", dateIso: at(3, 2), sizeKb: 46.8, type: "automatique", durationSeconds: null, status: "erreur" },
    { id: "b-6", dateIso: at(4, 2), sizeKb: 46.3, type: "automatique", durationSeconds: 115, status: "succes" },
  ]
}

interface BackupHistoryState {
  entries: BackupEntry[]
  hasSeeded: boolean
  ensureSeeded: () => void
  recordBackup: (sizeKb: number, type: BackupType, durationSeconds: number) => void
}

export const useBackupHistoryStore = create<BackupHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      hasSeeded: false,
      ensureSeeded: () => {
        if (get().hasSeeded) return
        set({ entries: seedHistory(), hasSeeded: true })
      },
      recordBackup: (sizeKb, type, durationSeconds) =>
        set({
          entries: [
            { id: `b-${Date.now()}`, dateIso: new Date().toISOString(), sizeKb, type, durationSeconds, status: "succes" },
            ...get().entries,
          ],
        }),
    }),
    {
      name: "agriconnect-backup-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries, hasSeeded: state.hasSeeded }),
    }
  )
)
