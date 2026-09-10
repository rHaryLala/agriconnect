import { useTranslation } from "react-i18next"
import { Check, Globe } from "lucide-react"

const LANGUAGES = ["fr", "en", "mg"] as const

export function LanguageRegionSection() {
  const { t, i18n } = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.language.sectionTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.language.sectionDescription")}</p>

        <div className="flex flex-col gap-2 sm:max-w-md">
          {LANGUAGES.map((lang) => {
            const active = i18n.language === lang
            return (
              <button
                key={lang}
                type="button"
                onClick={() => i18n.changeLanguage(lang)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-background"
                }`}
              >
                <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{t(`language.${lang}`)}</span>
                  <span className="block text-xs text-muted-foreground">{t(`language.${lang}Region`)}</span>
                </span>
                {active && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.language.regionTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.language.regionDescription")}</p>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldTimezone")}</dt>
            <dd className="mt-1 text-sm text-foreground">Africa/Antananarivo (UTC+3)</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldDateFormat")}</dt>
            <dd className="mt-1 text-sm text-foreground">JJ/MM/AAAA</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldCurrency")}</dt>
            <dd className="mt-1 text-sm text-foreground">Ariary (MGA)</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
