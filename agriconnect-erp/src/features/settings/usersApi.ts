import { apiFetch } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import { toFrontendRole, toBackendRole } from "@/lib/roleMapping"
import type { User, UserRole, UserStatus } from "@/types/user"
import { mockFetchUsers, mockCreateUser, mockUpdateUser, mockDeleteUser } from "@/features/auth/mockUsersApi"

interface BackendUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface UserFormValues {
  name: string
  email: string
  role: UserRole
  status?: UserStatus
}

function toFrontendUser(u: BackendUser): User {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    role: toFrontendRole(u.role),
    avatarInitials: `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase(),
    // SÉQUELLE : le schéma n'a pas User.status. Tant que le DBA ne l'a pas
    // ajouté, l'état affiché est une valeur par défaut et non une donnée.
    status: "actif",
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return { firstName, lastName: rest.join(" ") || firstName }
}

const TEMP_INITIAL_PASSWORD = "1234qwerty"

export function fetchUsers(token: string): Promise<User[]> {
  return withMockFallback(
    "users",
    async () => (await apiFetch<BackendUser[]>("/users", { token })).map(toFrontendUser),
    () => mockFetchUsers(),
  )
}

export function createUser(token: string, values: UserFormValues): Promise<User> {
  const { firstName, lastName } = splitName(values.name)
  return withMockFallback(
    "users",
    async () =>
      toFrontendUser(
        await apiFetch<BackendUser>("/users", {
          method: "POST",
          token,
          body: {
            email: values.email,
            password: TEMP_INITIAL_PASSWORD,
            firstName,
            lastName,
            role: toBackendRole(values.role),
          },
        }),
      ),
    () => mockCreateUser(values),
  )
}

export function updateUserApi(token: string, id: string, values: UserFormValues): Promise<User> {
  const { firstName, lastName } = splitName(values.name)
  return withMockFallback(
    "users",
    async () =>
      toFrontendUser(
        await apiFetch<BackendUser>(`/users/${id}`, {
          method: "PATCH",
          token,
          // UpdateUserDto n'accepte ni email ni status : les envoyer déclencherait
          // un 400 (forbidNonWhitelisted).
          body: { firstName, lastName, role: toBackendRole(values.role) },
        }),
      ),
    () => mockUpdateUser(id, values),
  )
}

export function deleteUserApi(token: string, id: string): Promise<void> {
  return withMockFallback(
    "users",
    () => apiFetch<void>(`/users/${id}`, { method: "DELETE", token }),
    () => mockDeleteUser(id),
  )
}
