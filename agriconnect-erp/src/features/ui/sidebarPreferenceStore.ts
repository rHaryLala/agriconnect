import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarPreferenceState {
  collapsed: boolean
  closedItems: string[]
  toggle: () => void
  toggleItem: (to: string) => void
}

export const useSidebarPreferenceStore = create<SidebarPreferenceState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      closedItems: [],
      toggle: () => set({ collapsed: !get().collapsed }),
      toggleItem: (to) => {
        const closed = get().closedItems
        set({ closedItems: closed.includes(to) ? closed.filter((item) => item !== to) : [...closed, to] })
      },
    }),
    {
      name: "agriconnect-sidebar-collapsed",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<SidebarPreferenceState>
        return { ...state, closedItems: state.closedItems ?? [] } as SidebarPreferenceState
      },
    },
  ),
)
