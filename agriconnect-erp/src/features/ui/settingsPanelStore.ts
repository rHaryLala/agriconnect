import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsPanelState {
  collapsed: boolean
  toggle: () => void
}
export const useSettingsPanelStore = create<SettingsPanelState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      toggle: () => set({ collapsed: !get().collapsed }),
    }),
    { name: "agriconnect-settings-collapsed" }
  )
)