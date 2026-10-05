import { create } from "zustand"

/**
 * Consentement aux traceurs non essentiels.
 *
 * Volontairement écrit à la main plutôt qu'avec le middleware `persist` de
 * Zustand, pour deux raisons :
 *  - le choix doit être lisible AVANT le premier rendu React, puisque c'est lui
 *    qui décide si Sentry est initialisé dans main.tsx ;
 *  - il porte une date d'expiration, ce que `persist` ne sait pas gérer seul.
 */

const STORAGE_KEY = "agriconnect-cookie-consent"

/**
 * Six mois. Au-delà, on redemande : un consentement donné il y a deux ans
 * sur une version différente de l'application n'en est plus un.
 */
const VALIDITY_DAYS = 180

/** Version du contenu soumis au consentement. */
const CONSENT_VERSION = 1

export type ConsentCategory = "essential" | "measurement"

export interface ConsentChoice {
  /** Toujours true : refuser l'essentiel reviendrait à refuser le service. */
  essential: true
  /** Supervision technique des erreurs (Sentry). */
  measurement: boolean
}

interface StoredConsent extends ConsentChoice {
  version: number
  /** ISO 8601, date de la décision. */
  decidedAt: string
}

export const ALL_DENIED: ConsentChoice = { essential: true, measurement: false }
export const ALL_GRANTED: ConsentChoice = { essential: true, measurement: true }

function isExpired(decidedAt: string): boolean {
  const decided = new Date(decidedAt).getTime()
  if (Number.isNaN(decided)) return true
  return Date.now() - decided > VALIDITY_DAYS * 24 * 60 * 60 * 1000
}

/**
 * Lit le choix enregistré, ou null s'il n'y en a pas, s'il a expiré, ou s'il
 * porte sur une version antérieure du document.
 *
 * Chaque accès est protégé : en navigation privée ou avec les données de site
 * bloquées, `localStorage` peut lever au lieu de renvoyer null. Une exception
 * ici empêcherait l'application de démarrer — et l'absence de choix lisible
 * doit toujours signifier « pas de consentement », donc pas de traceur.
 */
export function readStoredConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    if (parsed.version !== CONSENT_VERSION) return null
    if (typeof parsed.decidedAt !== "string" || isExpired(parsed.decidedAt)) return null
    if (typeof parsed.measurement !== "boolean") return null

    return { essential: true, measurement: parsed.measurement }
  } catch {
    return null
  }
}

function writeStoredConsent(choice: ConsentChoice): void {
  const payload: StoredConsent = {
    ...choice,
    essential: true,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Stockage indisponible : le choix vaut pour la session en cours et le
    // bandeau reviendra au prochain chargement. Préférable à un plantage.
  }
}

interface ConsentState {
  /** null = aucune décision valide : le bandeau doit s'afficher. */
  choice: ConsentChoice | null
  /** Vrai quand l'utilisateur a rouvert ses préférences depuis le pied de page. */
  isPanelOpen: boolean
  decide: (choice: ConsentChoice) => void
  acceptAll: () => void
  rejectAll: () => void
  openPanel: () => void
  closePanel: () => void
}

export const useConsentStore = create<ConsentState>((set) => ({
  choice: readStoredConsent(),
  isPanelOpen: false,

  decide: (choice) => {
    writeStoredConsent(choice)
    set({ choice, isPanelOpen: false })
    applyConsent(choice)
  },

  acceptAll: () => useConsentStore.getState().decide(ALL_GRANTED),
  rejectAll: () => useConsentStore.getState().decide(ALL_DENIED),

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
}))

/**
 * Active les traceurs correspondant au choix.
 *
 * Appelé au démarrage (main.tsx) et à chaque décision. L'initialisation de
 * Sentry n'est pas réversible sans rechargement : accorder le consentement
 * l'active immédiatement, le retirer ne prend effet qu'au prochain chargement.
 * C'est signalé à l'utilisateur dans le panneau de préférences plutôt que
 * caché, parce qu'un bouton qui prétend couper quelque chose sans le couper
 * serait pire que l'aveu.
 */
export function applyConsent(choice: ConsentChoice | null): void {
  if (choice?.measurement) {
    void import("@/lib/sentry").then(({ initSentry }) => initSentry())
  }
  // Pas de branche `else` : ce qui protège l'utilisateur, c'est que
  // `Sentry.init()` n'est jamais appelé sans consentement. Le SDK lui-même
  // reste présent dans le bundle — apiClient.ts et roleMapping.ts l'importent
  // statiquement — mais sans `init()` ses appels `captureException` sont inertes
  // et aucune donnée ne quitte le navigateur.
}
