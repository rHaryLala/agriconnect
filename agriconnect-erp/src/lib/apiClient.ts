import * as Sentry from "@sentry/react"

const API_URL = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  token?: string | null
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    const rawMessage = errorBody?.message
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? `Erreur ${res.status}`)
    const error = new ApiError(res.status, message)
    // Le corps de réponse n'est jamais transmis à Sentry : il peut contenir des
    // données saisies par l'utilisateur (email, champs de formulaire, etc.).
    Sentry.captureException(error, { extra: { path, status: res.status } })

    // Un 401 sur une requête authentifiée signifie un jeton expiré ou révoqué, pas
    // des identifiants invalides (le login, lui, appelle apiFetch sans token) :
    // on déconnecte au lieu de laisser l'appelant traiter ça comme une erreur ordinaire.
    // Import dynamique pour éviter le cycle apiClient -> authStore -> api -> apiClient.
    if (res.status === 401 && options.token) {
      const { useAuthStore } = await import("@/features/auth/authStore")
      useAuthStore.getState().logout("expired")
    }

    throw error
  }

  if (res.status === 204) return undefined as T
  return res.json()
}