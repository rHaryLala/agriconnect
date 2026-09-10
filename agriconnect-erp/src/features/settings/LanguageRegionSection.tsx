import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Check, LocateFixed, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useRegionStore, REGIONS, detectRegionFromBrowser, detectRegionFromCoords, type RegionCode } from "./regionStore"

const LANGUAGES = [
  { code: "fr", flag: "🇫🇷" },
  { code: "en", flag: "🇬🇧" },
  { code: "mg", flag: "🇲🇬" },
] as const

const REGION_FLAGS: Record<RegionCode, string> = { MG: "🇲🇬", FR: "🇫🇷", GB: "🇬🇧" }
const REGION_ORDER: RegionCode[] = ["MG", "FR", "GB"]

export function LanguageRegionSection() {
  const { t, i18n } = useTranslation()
  const { region, autoDetected, setRegion } = useRegionStore()
  const [detecting, setDetecting] = useState(false)

  const definition = REGIONS[region]

  function applyRegion(code: RegionCode, auto = false) {
    setRegion(code, auto)
    toast.success(t("settings.language.toastRegionApplied", { region: t(`settings.language.region${code}`) }))
  }

  function handleDetect() {
    setDetecting(true)

    const finish = (code: RegionCode | null) => {
      setDetecting(false)
      if (code) applyRegion(code, true)
      else toast.error(t("settings.language.toastRegionNotDetected"))
    }

    if (!navigator.geolocation) {
      finish(detectRegionFromBrowser())
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => finish(detectRegionFromCoords(position.coords.latitude, position.coords.longitude) ?? detectRegionFromBrowser()),
      () => finish(detectRegionFromBrowser()),
      { timeout: 8000 }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.language.sectionTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.language.sectionDescription")}</p>

        <div className="flex flex-col gap-2 sm:max-w-md">
          {LANGUAGES.map(({ code, flag }) => {
            const active = i18n.language === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => i18n.changeLanguage(code)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-background"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">{flag}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{t(`language.${code}`)}</span>
                  <span className="block text-xs text-muted-foreground">{t(`language.${code}Region`)}</span>
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
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              {t("settings.language.regionTitle")}
              {autoDetected && <StatusBadge label={t("settings.language.autoDetected")} tone="info" />}
            </p>
            <p className="text-xs text-muted-foreground">{t("settings.language.regionDescription")}</p>
          </div>
          <Button type="button" variant="outline" onClick={handleDetect} disabled={detecting} className="gap-2">
            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {t("settings.language.detectButton")}
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:max-w-md">
          {REGION_ORDER.map((code) => {
            const active = region === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => applyRegion(code)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-background"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">{REGION_FLAGS[code]}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-foreground">{t(`settings.language.region${code}`)}</span>
                  <span className="block text-xs text-muted-foreground">{REGIONS[code].timezone}</span>
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

        <dl className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldTimezone")}</dt>
            <dd className="mt-1 text-sm text-foreground">{definition.timezone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldDateFormat")}</dt>
            <dd className="mt-1 text-sm text-foreground">{definition.dateFormat}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("settings.language.fieldCurrency")}</dt>
            <dd className="mt-1 text-sm text-foreground">{definition.currencyLabel}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
