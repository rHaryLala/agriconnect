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
    console.error("DÉTAIL DE L'ERREUR BACKEND :", errorBody);
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : (rawMessage ?? `Erreur ${res.status}`)
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}