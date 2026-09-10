import { useTranslation } from "react-i18next"
import { Sun, Moon, Check } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"

export function AppearanceSection() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const options = [
    { value: "light" as const, label: t("settings.appearance.themeLight"), icon: Sun },
    { value: "dark" as const, label: t("settings.appearance.themeDark"), icon: Moon },
  ]

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <p className="mb-1 text-sm font-semibold text-foreground">{t("settings.appearance.themeTitle")}</p>
      <p className="mb-4 text-xs text-muted-foreground">{t("settings.appearance.themeDescription")}</p>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        {options.map(({ value, label, icon: Icon }) => {
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
  )
}
