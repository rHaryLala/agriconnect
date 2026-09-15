import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface AvatarState {
  avatars: Record<string, string>
  setAvatar: (userId: string, dataUrl: string) => void
  removeAvatar: (userId: string) => void
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      avatars: {},
      setAvatar: (userId, dataUrl) => set({ avatars: { ...get().avatars, [userId]: dataUrl } }),
      removeAvatar: (userId) => {
        const next = { ...get().avatars }
        delete next[userId]
        set({ avatars: next })
      },
    }),
    { name: "agriconnect-avatars", storage: createJSONStorage(() => localStorage) }
  )
)

export const MAX_AVATAR_BYTES = 512 * 1024
