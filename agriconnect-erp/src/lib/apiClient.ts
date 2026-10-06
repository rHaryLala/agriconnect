import * as Sentry from "@sentry/react"

// Le backend monte tout sous api/v1 (setGlobalPrefix dans main.ts). Le préfixe
// est ajouté ici, une fois, plutôt que dans chaque appel.
const API_PREFIX = "/api/v1"

const API_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/+$/, "") ?? ""

export class ApiError extends Error {
  status: number
  /** true quand la requête n'a jamais atteint le serveur (DNS, TCP, CORS). */
  isNetworkError: boolean
  constructor(status: number, message: string, isNetworkError = false) {
    super(message)
    this.status = status
    this.isNetworkError = isNetworkError
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  token?: string | null
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${API_PREFIX}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    // fetch ne rejette que si la requête n'a pas abouti du tout. On le
    // distingue d'une réponse d'erreur : seul ce cas justifie un repli.
    throw new ApiError(0, "Serveur injoignable", true)
  }

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