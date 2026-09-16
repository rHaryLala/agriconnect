import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NavGroup } from "@/app/layout/navItems"

interface SidebarPreferenceState {
  collapsed: boolean
  closedGroups: NavGroup[]
  toggle: () => void
  toggleGroup: (group: NavGroup) => void
}

export const useSidebarPreferenceStore = create<SidebarPreferenceState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      closedGroups: [],
      toggle: () => set({ collapsed: !get().collapsed }),
      toggleGroup: (group) => {
        const closed = get().closedGroups
        set({ closedGroups: closed.includes(group) ? closed.filter((g) => g !== group) : [...closed, group] })
      },
    }),
    {
      name: "agriconnect-sidebar-collapsed",
      version: 1,
      migrate: (persisted) => {
        const state = persisted as Partial<SidebarPreferenceState>
        return { ...state, closedGroups: state.closedGroups ?? [] } as SidebarPreferenceState
      },
    },
  ),
)
