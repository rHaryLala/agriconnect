import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Permission } from "@/lib/permissions"

interface UserPermissionsState {
  overrides: Record<string, Permission[]>
  setOverride: (userId: string, permissions: Permission[]) => void
  clearOverride: (userId: string) => void
}

export const useUserPermissionsStore = create<UserPermissionsState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setOverride: (userId, permissions) => set({ overrides: { ...get().overrides, [userId]: permissions } }),
      clearOverride: (userId) => {
        const { [userId]: _removed, ...rest } = get().overrides
        set({ overrides: rest })
      },
    }),
    {
      name: "agriconnect-user-permissions",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
