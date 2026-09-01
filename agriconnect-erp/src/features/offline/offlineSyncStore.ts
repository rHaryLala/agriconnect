import { create } from "zustand"

interface OfflineSyncState {
  pendingCount: number
  setPendingCount: (n: number) => void
}

export const useOfflineSyncStore = create<OfflineSyncState>((set) => ({
  pendingCount: 0,
  setPendingCount: (n) => set({ pendingCount: n }),
}))