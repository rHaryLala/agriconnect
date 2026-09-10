import { useTranslation } from "react-i18next"
import { Sun, Moon, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/hooks/useTheme"
import { useAppearanceStore, applyAppearance, ACCENT_COLORS, type AccentColor } from "./appearanceStore"

export function AppearanceSection() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { accent, compactView, animations, setAccent, setCompactView, setAnimations } = useAppearanceStore()

  const themeOptions = [
    { value: "light" as const, label: t("settings.appearance.themeLight"), icon: Sun },
    { value: "dark" as const, label: t("settings.appearance.themeDark"), icon: Moon },
  ]

  function changeAccent(value: AccentColor) {
    setAccent(value)
    applyAppearance(value, compactView, animations)
  }

  function changeCompact(value: boolean) {
    setCompactView(value)
    applyAppearance(accent, value, animations)
  }

  function changeAnimations(value: boolean) {
    setAnimations(value)
    applyAppearance(accent, compactView, value)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.appearance.themeTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.appearance.themeDescription")}</p>

        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          {themeOptions.map(({ value, label, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => { if (theme !== value) toggleTheme() }}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-6 text-sm font-medium transition-colors ${
                  active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:bg-background"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
                {active && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.appearance.densityTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.appearance.densityDescription")}</p>

        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("settings.appearance.compactTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.appearance.compactDescription")}</p>
            </div>
            <Switch checked={compactView} onCheckedChange={changeCompact} />
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("settings.appearance.animationsTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.appearance.animationsDescription")}</p>
            </div>
            <Switch checked={animations} onCheckedChange={changeAnimations} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.appearance.accentTitle")}</p>
        <p className="mb-4 text-xs text-muted-foreground">{t("settings.appearance.accentDescription")}</p>

        <div className="flex flex-wrap gap-3">
          {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => {
            const active = accent === color
            return (
              <button
                key={color}
                type="button"
                onClick={() => changeAccent(color)}
                aria-label={t(`settings.appearance.accent${color.charAt(0).toUpperCase()}${color.slice(1)}`)}
                aria-pressed={active}
                style={{ backgroundColor: ACCENT_COLORS[color].swatch }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                  active ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-surface" : ""
                }`}
              >
                {active && <Check className="h-4 w-4 text-white" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
