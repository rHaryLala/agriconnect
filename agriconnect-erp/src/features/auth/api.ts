import { apiFetch, ApiError } from "@/lib/apiClient"
import { toFrontendRole } from "@/lib/roleMapping"
import type { User } from "@/types/user"

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