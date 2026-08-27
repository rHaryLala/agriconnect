import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarPreferenceState {
  collapsed: boolean
  toggle: () => void
}

export const useSidebarPreferenceStore = create<SidebarPreferenceState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      toggle: () => set({ collapsed: !get().collapsed }),
    }),
    { name: "agriconnect-sidebar-collapsed" }
  )
)