import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

/**
 * Profile photos are stored locally as data URLs: the backend user contract has no
 * avatar field, so uploading one server-side isn't possible yet.
 */
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
