import { useEffect } from "react"

/**
 * Pose le titre, la description et les métadonnées de partage d'une page, puis
 * les retire au démontage.
 *
 * Écrit à la main plutôt qu'avec react-helmet : une seule dépendance évitée
 * pour une trentaine de lignes, et surtout l'application est une SPA dont les
 * seules pages indexables sont l'accueil et les trois documents légaux. Le
 * reste est derrière authentification, donc hors de portée d'un crawler.
 *
 * Limite assumée : ces balises sont posées côté client. Les moteurs qui
 * exécutent JavaScript les voient ; un agent qui se contente du HTML brut ne
 * verra que ce qui est dans index.html. C'est pourquoi index.html porte déjà
 * une description et un bloc JSON-LD par défaut : ce hook enrichit, il ne
 * remplace pas.
 */

interface DocumentMeta {
  title: string
  description: string
  /** Chemin canonique, sans le domaine (ex. "/legal/cookies"). */
  path: string
  /** JSON-LD propre à la page, sérialisé dans un script dédié. */
  jsonLd?: Record<string, unknown>
  /** robots : "index" par défaut, "noindex" pour les écrans privés. */
  robots?: "index,follow" | "noindex,nofollow"
}

const SITE_URL = "https://agriconnect.zurcher.edu.mg"

/** Crée la balise si elle manque, et signale si c'est nous qui l'avons créée. */
function upsertMeta(selector: string, attrs: Record<string, string>): () => void {
  const existing = document.head.querySelector(selector)
  if (existing) {
    const previous = { ...attrs }
    for (const key of Object.keys(attrs)) previous[key] = existing.getAttribute(key) ?? ""
    for (const [key, value] of Object.entries(attrs)) existing.setAttribute(key, value)
    // On restaure l'ancienne valeur : la balise appartenait à index.html.
    return () => {
      for (const [key, value] of Object.entries(previous)) {
        if (value) existing.setAttribute(key, value)
      }
    }
  }

  const element = document.createElement("meta")
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value)
  document.head.appendChild(element)
  return () => element.remove()
}

export function useDocumentMeta({ title, description, path, jsonLd, robots = "index,follow" }: DocumentMeta) {
  // Serialise avant l'effet : un objet litteral passe en dependance serait
  // recree a chaque rendu et relancerait l'effet en boucle.
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    const previousTitle = document.title
    const fullTitle = `${title} — AgriConnect`
    const url = `${SITE_URL}${path}`
    document.title = fullTitle

    const cleanups: (() => void)[] = [
      upsertMeta('meta[name="description"]', { name: "description", content: description }),
      upsertMeta('meta[name="robots"]', { name: "robots", content: robots }),
      upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle }),
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: description }),
      upsertMeta('meta[property="og:url"]', { property: "og:url", content: url }),
      upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" }),
      upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" }),
    ]

    // Lien canonique : sans lui, la même page atteinte avec des paramètres
    // d'URL différents compte comme plusieurs pages distinctes.
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const canonicalCreated = !canonical
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    const previousCanonical = canonical.href
    canonical.href = url

    let script: HTMLScriptElement | null = null
    if (jsonLdText) {
      script = document.createElement("script")
      script.type = "application/ld+json"
      // data-page distingue ce bloc de celui, permanent, d'index.html.
      script.dataset.page = path
      script.textContent = jsonLdText
      document.head.appendChild(script)
    }

    return () => {
      document.title = previousTitle
      for (const cleanup of cleanups) cleanup()
      if (canonicalCreated) canonical?.remove()
      else if (canonical) canonical.href = previousCanonical
      script?.remove()
    }
  }, [title, description, path, robots, jsonLdText])
}

export { SITE_URL }
