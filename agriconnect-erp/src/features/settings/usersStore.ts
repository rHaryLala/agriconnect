import { create } from "zustand"
import type { User } from "@/types/user"

const FAKE_LATENCY_MS = 500

const SEED_USERS: User[] = [
  { id: "1", name: "LESOA Asandratriniaina", email: "lesoa.asa@zurcher.edu.mg", role: "admin", avatarInitials: "LA" },
  { id: "2", name: "RASAMIZAFY Simeon", email: "rasamizafy.sit@zurcher.edu.mg", role: "finance_commercial", avatarInitials: "RS" },
  { id: "3", name: "RADONIAINA Voahary", email: "radoniaina.v@zurcher.edu.mg", role: "operations", avatarInitials: "RV" },
  { id: "4", name: "RABENAMANA Hary", email: "rabenamana.h@zurcher.edu.mg", role: "operations", avatarInitials: "RH" },
]

interface UsersState {
  users: User[]
  isLoading: boolean
  fetchUsers: () => Promise<void>
  addUser: (data: Omit<User, "id" | "avatarInitials">) => Promise<void>
  updateUser: (id: string, data: Omit<User, "id" | "avatarInitials">) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: () =>
    new Promise((resolve) => {
      set({ isLoading: true })
      setTimeout(() => {
        set({ users: SEED_USERS, isLoading: false })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  addUser: (data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = { ...data, id: `u-${Date.now()}`, avatarInitials: initials(data.name) }
        set({ users: [...get().users, newUser] })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  updateUser: (id, data) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, ...data, avatarInitials: initials(data.name) } : u)),
        })
        resolve()
      }, FAKE_LATENCY_MS)
    }),

  deleteUser: (id) =>
    new Promise((resolve) => {
      setTimeout(() => {
        set({ users: get().users.filter((u) => u.id !== id) })
        resolve()
      }, FAKE_LATENCY_MS)
    }),
}))