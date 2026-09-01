import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const LANGUAGES = ["fr", "en", "mg"] as const

interface LanguageSwitcherProps {
  compact?: boolean
  variant?: "default" | "onDark"
}

export function LanguageSwitcher({ compact = false, variant = "default" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()

  const getCurrentLanguageName = () => {
    const langMap = { fr: "FR", en: "EN", mg: "MG" }
    return langMap[i18n.language as keyof typeof langMap] || "FR"
  }

  const compactClasses =
    variant === "onDark"
      ? "h-9 w-auto gap-1 border border-white/20 bg-white/10 px-2 text-white hover:text-white hover:bg-white/20"
      : "h-9 w-auto gap-1 border-none bg-transparent px-2 text-foreground hover:text-foreground hover:bg-accent/10"

  return (
    <Select value={i18n.language ?? undefined} onValueChange={(lang) => i18n.changeLanguage(lang ?? undefined)}>
      <SelectTrigger className={compact ? compactClasses : "w-full"} aria-label={t("language.label")}>
        {compact ? (
          <>
            <Languages className="h-4 w-4" />
            <span className="text-xs font-medium">{getCurrentLanguageName()}</span>
          </>
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {t(`language.${lang}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}