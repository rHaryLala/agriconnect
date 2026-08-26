import { apiFetch, ApiError } from "@/lib/apiClient"
import { toFrontendRole } from "@/lib/roleMapping"
import type { User } from "@/types/user"
import { MOCK_USERS } from "./mockUsers"

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true"

interface LoginResponse {
  access_token: string
  user: { id: string; email: string; firstName: string; lastName: string; role: string }
}

export async function realLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    })
    const user: User = {
      id: data.user.id,
      name: `${data.user.firstName} ${data.user.lastName}`,
      email: data.user.email,
      role: toFrontendRole(data.user.role),
      avatarInitials: `${data.user.firstName[0] ?? ""}${data.user.lastName[0] ?? ""}`.toUpperCase(),
    }
    return { user, token: data.access_token }
  } catch (err) {
    if (err instanceof ApiError) throw new Error(err.status === 401 ? "Email ou mot de passe incorrect." : err.message)
    throw new Error("Impossible de contacter le serveur. Vérifie ta connexion.")
  }
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

export const login = USE_MOCK_API ? mockLogin : realLogin
