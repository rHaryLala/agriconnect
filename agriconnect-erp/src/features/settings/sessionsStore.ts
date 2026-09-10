import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface ActiveSession {
  id: string
  browser: string
  os: string
  location: string
  lastActiveIso: string
  current: boolean
}

/**
 * Session tracking is not implemented server-side yet, so the list is seeded
 * locally: the current entry is read from the real browser, the others are
 * demo rows that can be revoked to exercise the flow.
 */
function detectCurrentSession(): ActiveSession {
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navigateur"
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Système"
  return { id: "current", browser, os, location: "Antananarivo, MG", lastActiveIso: new Date().toISOString(), current: true }
}

function seedSessions(): ActiveSession[] {
  const now = Date.now()
  return [
    detectCurrentSession(),
    { id: "s-2", browser: "Safari", os: "iPhone 14", location: "Antsirabe, MG", lastActiveIso: new Date(now - 2 * 3600_000).toISOString(), current: false },
    { id: "s-3", browser: "Firefox", os: "macOS", location: "Sambaina, MG", lastActiveIso: new Date(now - 26 * 3600_000).toISOString(), current: false },
  ]
}

interface SessionsState {
  sessions: ActiveSession[]
  hasSeeded: boolean
  ensureSeeded: () => void
  revokeSession: (id: string) => void
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      hasSeeded: false,
      ensureSeeded: () => {
        if (get().hasSeeded) {
          // Keep the "current" row in sync with the browser actually being used.
          set({ sessions: get().sessions.map((s) => (s.current ? { ...detectCurrentSession(), id: s.id } : s)) })
          return
        }
        set({ sessions: seedSessions(), hasSeeded: true })
      },
      revokeSession: (id) => set({ sessions: get().sessions.filter((s) => s.id !== id) }),
    }),
    {
      name: "agriconnect-sessions",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sessions: state.sessions, hasSeeded: state.hasSeeded }),
    }
  )
)
