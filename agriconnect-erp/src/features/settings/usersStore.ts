import { create } from "zustand"
import type { User } from "@/types/user"
import { useAuthStore } from "@/features/auth/authStore"
import { fetchUsers, createUser, updateUserApi, deleteUserApi } from "./usersApi"

interface UsersState {
  users: User[]
  isLoading: boolean
  fetchUsers: () => Promise<void>
  addUser: (data: Omit<User, "id" | "avatarInitials">) => Promise<void>
  updateUser: (id: string, data: Omit<User, "id" | "avatarInitials">) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

function getToken(): string {
  const token = useAuthStore.getState().token
  if (!token) throw new Error("Non authentifié")
  return token
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true })
    try {
      const users = await fetchUsers(getToken())
      set({ users, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  addUser: async (data) => {
    const user = await createUser(getToken(), data)
    set({ users: [...get().users, user] })
  },

  updateUser: async (id, data) => {
    const user = await updateUserApi(getToken(), id, data)
    set({ users: get().users.map((u) => (u.id === id ? user : u)) })
  },

  deleteUser: async (id) => {
    await deleteUserApi(getToken(), id)
    set({ users: get().users.filter((u) => u.id !== id) })
  },
}))