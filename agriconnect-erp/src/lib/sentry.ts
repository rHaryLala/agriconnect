import * as Sentry from "@sentry/react"

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key] as string | undefined
  return value && value.trim() !== "" ? value.trim() : undefined
}

const DEFAULT_TRACES_SAMPLE_RATE = 0.1

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
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
    sendDefaultPii: false,
  })
}
