/**
 * localStorage keys holding farm operational records (production, finance, personnel, stock...).
 * Cleared on logout so the next person to sign in on a shared device doesn't inherit
 * the previous account's business data. Device/UI preferences (theme, language, avatars,
 * referential lists such as crop types or egg prices) are deliberately left out: they
 * aren't tied to a specific account and losing them on every logout would only be
 * disruptive.
 */
export const SESSION_SCOPED_STORAGE_KEYS = [
  "agriconnect-invoices",
  "agriconnect-stock",
  "agriconnect-fournisseurs",
  "agriconnect-finance",
  "agriconnect-clients",
  "agriconnect-personnel",
  "agriconnect-regularisations",
  "agriconnect-production",
  "agriconnect-bovins",
  "agriconnect-poulard",
  "agriconnect-riz",
  "agriconnect-haricots",
  "agriconnect-egg-sales",
  "agriconnect-kuroiler-oeufs",
  "agriconnect-kuroiler-poules",
  "agriconnect-carburant",
  "agriconnect-engrais",
  "agriconnect-main-oeuvre",
  "agriconnect-backup-history",
  "agriconnect-sessions",
] as const

export function clearSessionScopedStorage(): void {
  for (const key of SESSION_SCOPED_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}
