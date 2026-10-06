import { ApiError } from "./apiClient"

/** Drapeau maître : true = jeux de données locaux, false = API réelle. */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true"

/**
 * Appelle l'API, et retombe sur le mock si le serveur est injoignable.
 *
 * Le repli ne couvre QUE la panne : serveur inaccessible, ou erreur 5xx. Un 4xx
 * est une réponse du serveur — un 401 veut dire « mauvais identifiants », un 409
 * « ce nom existe déjà ». Y répondre par des données de démonstration
 * masquerait l'erreur et ferait croire à une réussite.
 */
export async function withMockFallback<T>(
  domaine: string,
  real: () => Promise<T>,
  mock: () => Promise<T>,
): Promise<T> {
  if (USE_MOCK_API) return mock()

  try {
    return await real()
  } catch (error) {
    const estPanne = error instanceof ApiError && (error.isNetworkError || error.status >= 500)
    if (!estPanne) throw error

    console.warn(`[api] ${domaine} : serveur indisponible, repli sur les données locales.`)
    return mock()
  }
}
