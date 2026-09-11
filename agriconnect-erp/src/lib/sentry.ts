import * as Sentry from "@sentry/react"

// Une variable absente et une variable laissée vide doivent se comporter
// pareil : sans cela « VITE_SENTRY_TRACES_SAMPLE_RATE= » donnerait 0
// et désactiverait le tracing sans le dire.
function readEnv(key: string): string | undefined {
  const value = import.meta.env[key] as string | undefined
  return value && value.trim() !== "" ? value.trim() : undefined
}

const DEFAULT_TRACES_SAMPLE_RATE = 0.1

// Le DSN vient de l'environnement : aucune clé n'est écrite dans le code.
// Sans DSN configuré, Sentry reste totalement inactif (développement, tests).
export function initSentry() {
  const dsn = readEnv("VITE_SENTRY_DSN")
  if (!dsn) return

  const sampleRate = Number(readEnv("VITE_SENTRY_TRACES_SAMPLE_RATE"))

  Sentry.init({
    dsn,
    environment: readEnv("VITE_SENTRY_ENVIRONMENT") ?? import.meta.env.MODE,
    release: readEnv("VITE_SENTRY_RELEASE"),
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: Number.isFinite(sampleRate) ? sampleRate : DEFAULT_TRACES_SAMPLE_RATE,
    // L'application est hors-ligne par conception : les évènements émis sans
    // réseau sont mis en attente puis renvoyés à la reconnexion.
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
    sendDefaultPii: false,
  })
}
