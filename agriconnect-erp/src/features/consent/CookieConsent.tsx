import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Cookie, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConsentStore, ALL_DENIED, ALL_GRANTED } from "./consentStore"
import type { ConsentChoice } from "./consentStore"

/**
 * Bandeau de consentement aux traceurs non essentiels.
 *
 * Il s'affiche tant qu'aucune décision valide n'est enregistrée, et se rouvre
 * depuis le pied de page. Monté via createPortal sur <body> : l'application
 * contient des conteneurs animés dont la transformation CSS piège
 * `position: fixed`, ce qui plaquerait le bandeau au milieu de la page.
 *
 * Les trois actions sont données à égalité visuelle. « Refuser » n'est ni
 * caché, ni déguisé en lien discret : un refus qui demande plus d'efforts
 * qu'une acceptation n'est pas un consentement libre.
 */
export function CookieConsent() {
  const { t } = useTranslation()
  const choice = useConsentStore((state) => state.choice)
  const isPanelOpen = useConsentStore((state) => state.isPanelOpen)
  const decide = useConsentStore((state) => state.decide)
  const closePanel = useConsentStore((state) => state.closePanel)
  const openPanel = useConsentStore((state) => state.openPanel)

  const needsDecision = choice === null
  const visible = needsDecision || isPanelOpen

  // Brouillon local du panneau : les cases à cocher ne doivent rien appliquer
  // avant la validation, sinon fermer le panneau laisserait un choix à moitié
  // enregistré.
  const [draft, setDraft] = useState<ConsentChoice>(choice ?? ALL_DENIED)
  useEffect(() => {
    if (isPanelOpen) setDraft(choice ?? ALL_DENIED)
  }, [isPanelOpen, choice])

  const containerRef = useRef<HTMLDivElement>(null)

  // Le focus entre dans le bandeau à l'ouverture : sans cela, un utilisateur au
  // clavier devrait traverser toute la page avant d'atteindre les boutons.
  // On cible par attribut plutôt qu'avec une ref sur <Button> : ce composant
  // n'est pas un forwardRef, lui passer une ref dépendrait d'un détail
  // d'implémentation de la primitive qu'il enveloppe.
  useEffect(() => {
    if (!visible) return
    containerRef.current?.querySelector<HTMLElement>("[data-consent-primary]")?.focus()
  }, [visible, isPanelOpen])

  // Échap ferme le panneau rouvert depuis le pied de page, mais jamais le
  // bandeau initial : l'esquiver au clavier équivaudrait à un consentement
  // implicite, ce qui n'en est pas un.
  useEffect(() => {
    if (!isPanelOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isPanelOpen, closePanel])

  if (!visible) return null

  const expanded = isPanelOpen

  return createPortal(
    <div
      ref={containerRef}
      // role="dialog" et non "alertdialog" : l'utilisateur peut continuer à
      // lire la page, notamment la politique de cookies liée ci-dessous.
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-card/95 p-4 shadow-[0_-8px_32px_-16px_rgb(0_0_0/0.35)] backdrop-blur-xl sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Cookie className="h-4 w-4 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="cookie-consent-title" className="text-sm font-semibold text-foreground">
              {t("consent.title")}
            </h2>
            <p id="cookie-consent-description" className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t("consent.description")}{" "}
              <Link
                to="/legal/cookies"
                className="rounded font-medium text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("consent.readPolicy")}
              </Link>
            </p>
          </div>

          {/* Fermer n'existe que pour le panneau rouvert volontairement. */}
          {isPanelOpen && !needsDecision && (
            <button
              type="button"
              onClick={closePanel}
              aria-label={t("common.close")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {expanded && (
          <fieldset className="rounded-xl border border-border bg-background/60 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("consent.categoriesLegend")}
            </legend>

            <div className="mt-2 flex flex-col gap-4">
              {/* Catégorie essentielle : affichée pour la transparence, mais
                  désactivée — sans elle l'application ne fonctionne pas, la
                  présenter comme un choix serait mensonger. */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-describedby="consent-essential-help"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {t("consent.essentialTitle")}{" "}
                    <span className="font-normal text-muted-foreground">({t("consent.alwaysActive")})</span>
                  </span>
                  <span id="consent-essential-help" className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {t("consent.essentialDescription")}
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={draft.measurement}
                  onChange={(event) => setDraft({ essential: true, measurement: event.target.checked })}
                  aria-describedby="consent-measurement-help"
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{t("consent.measurementTitle")}</span>
                  <span id="consent-measurement-help" className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {t("consent.measurementDescription")}
                  </span>
                </span>
              </label>
            </div>
          </fieldset>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {expanded ? (
            <>
              <Button variant="outline" onClick={() => decide(ALL_DENIED)} className="sm:order-1">
                {t("consent.rejectAll")}
              </Button>
              <Button onClick={() => decide(draft)} className="sm:order-3" data-consent-primary>
                {t("consent.saveChoice")}
              </Button>
              <Button variant="ghost" onClick={() => decide(ALL_GRANTED)} className="sm:order-2">
                {t("consent.acceptAll")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={openPanel} className="sm:order-1">
                {t("consent.customise")}
              </Button>
              <Button variant="outline" onClick={() => decide(ALL_DENIED)} className="sm:order-2">
                {t("consent.reject")}
              </Button>
              <Button onClick={() => decide(ALL_GRANTED)} className="sm:order-3" data-consent-primary>
                {t("consent.accept")}
              </Button>
            </>
          )}
        </div>

        {expanded && <p className="text-xs text-muted-foreground">{t("consent.revokeNotice")}</p>}
      </div>
    </div>,
    document.body,
  )
}

/** Lien de réouverture, à poser dans un pied de page. */
export function CookiePreferencesButton({ className }: { className?: string }) {
  const { t } = useTranslation()
  const openPanel = useConsentStore((state) => state.openPanel)

  return (
    <button type="button" onClick={openPanel} className={className}>
      {t("legal.cookiePreferences")}
    </button>
  )
}
