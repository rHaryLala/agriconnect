import { apiFetch, ApiError } from "@/lib/apiClient"
import { withMockFallback } from "@/lib/apiFallback"
import { toFrontendRole } from "@/lib/roleMapping"
import type { User } from "@/types/user"
import type { Permission } from "@/lib/permissions"
import { MOCK_USERS } from "./mockUsers"

interface BackendUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface LoginResponse {
  access_token: string
  user: BackendUser
}

interface MeResponse extends BackendUser {
  farmId: string
  permissions: Permission[]
}

function toUser(u: BackendUser): User {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    role: toFrontendRole(u.role),
    avatarInitials: `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase(),
  }
}

async function realLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await apiFetch<LoginResponse>("/auth/login", { method: "POST", body: { email, password } })
  return { user: toUser(data.user), token: data.access_token }
}

export async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const match = MOCK_USERS.find(
    (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password,
  )

  if (!match) throw new Error("Email ou mot de passe incorrect.")

  const { password: _password, ...user } = match
  return { user, token: `mock-token-${user.id}-${Date.now()}` }
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    return await withMockFallback("auth", () => realLogin(email, password), () => mockLogin(email, password))
  } catch (err) {
    if (err instanceof ApiError) {
      throw new Error(err.status === 401 ? "Email ou mot de passe incorrect." : err.message, { cause: err })
    }
    throw err
  }
}

/**
 * Profil et droits de l'utilisateur connecté.
 *
 * À appeler au démarrage : la réponse de login est figée à l'instant de la
 * connexion, donc un rôle modifié depuis n'y apparaît jamais.
 */
export async function fetchMe(token: string): Promise<{ user: User; permissions: Permission[] } | null> {
  return withMockFallback(
    "auth/me",
    async () => {
      const data = await apiFetch<MeResponse>("/auth/me", { token })
      return { user: toUser(data), permissions: data.permissions ?? [] }
    },
    // Hors ligne, le profil déjà en mémoire fait foi : on ne le remplace pas
    // par un utilisateur de démonstration.
    async () => null,
  )
}
