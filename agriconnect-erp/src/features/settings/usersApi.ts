import { apiFetch } from "@/lib/apiClient"
import { toFrontendRole, toBackendRole } from "@/lib/roleMapping"
import type { User, UserRole } from "@/types/user"

interface BackendUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

function toFrontendUser(u: BackendUser): User {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: toFrontendRole(u.role),
    avatarInitials: `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase(),
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return { firstName, lastName: rest.join(" ") || firstName }
}

export async function fetchUsers(token: string): Promise<User[]> {
  const data = await apiFetch<BackendUser[]>("/users", { token })
  return data.map(toFrontendUser)
}

const TEMP_INITIAL_PASSWORD = "1234qwerty" // TODO: Générer un mot de passe temporaire aléatoire et l'envoyer par email à l'utilisateur

export async function createUser(token: string, values: { name: string; email: string; role: UserRole }): Promise<User> {
  const { firstName, lastName } = splitName(values.name)
  const data = await apiFetch<BackendUser>("/users", {
    method: "POST",
    token,
    body: { email: values.email, password: TEMP_INITIAL_PASSWORD, firstName, lastName, role: toBackendRole(values.role) },
  })
  return toFrontendUser(data)
}

export async function updateUserApi(token: string, id: string, values: { name: string; email: string; role: UserRole }): Promise<User> {
  const { firstName, lastName } = splitName(values.name)
  const data = await apiFetch<BackendUser>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: { firstname: firstName, lastname: lastName, role: toBackendRole(values.role) },
  })
  return toFrontendUser(data)
}

export async function deleteUserApi(token: string, id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE", token })
}