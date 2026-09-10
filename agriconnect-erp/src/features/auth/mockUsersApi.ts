import type { User, UserRole, UserStatus } from "@/types/user"
import { MOCK_USERS } from "@/features/auth/mockUsers"

const STORAGE_KEY = "agriconnect-mock-users"
const SEED_VERSION_KEY = "agriconnect-mock-users-seed"
// Bump when MOCK_USERS changes so existing browsers pick up the new demo accounts.
const SEED_VERSION = "2"
const LATENCY_MS = 350

function seed(): User[] {
  return MOCK_USERS.map(({ password: _password, ...user }) => user)
}

function readAll(): User[] {
  try {
    if (localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION) throw new Error("stale-seed")
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error("empty")
    return JSON.parse(raw) as User[]
  } catch {
    const initial = seed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
    return initial
  }
}

function writeAll(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export async function mockFetchUsers(): Promise<User[]> {
  await delay()
  return readAll()
}

export async function mockCreateUser(values: { name: string; email: string; role: UserRole; status?: UserStatus }): Promise<User> {
  await delay()
  const users = readAll()

  if (users.some((u) => u.email.toLowerCase() === values.email.toLowerCase())) {
    throw new Error("Un utilisateur avec cet email existe déjà.")
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: values.name,
    email: values.email,
    role: values.role,
    avatarInitials: initials(values.name),
    status: values.status ?? "actif",
  }
  writeAll([...users, user])
  return user
}

export async function mockUpdateUser(id: string, values: { name: string; email: string; role: UserRole; status?: UserStatus }): Promise<User> {
  await delay()
  const users = readAll()
  const existing = users.find((u) => u.id === id)
  if (!existing) throw new Error("Utilisateur introuvable.")

  const updated: User = {
    ...existing,
    ...values,
    avatarInitials: initials(values.name),
    status: values.status ?? existing.status ?? "actif",
  }
  writeAll(users.map((u) => (u.id === id ? updated : u)))
  return updated
}

export async function mockDeleteUser(id: string): Promise<void> {
  await delay()
  writeAll(readAll().filter((u) => u.id !== id))
}
