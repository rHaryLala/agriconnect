import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const LANGUAGES = ["fr", "en", "mg"] as const

interface LanguageSwitcherProps {
  compact?: boolean
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()

      const getCurrentLanguageName = () => {
    const langMap = {
      fr: "FR",
      en: "EN", 
      mg: "MG"
    }
    return langMap[i18n.language as keyof typeof langMap] || "FR"
  }

  return (
    <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
      <SelectTrigger 
        className={compact 
          ? "h-9 w-auto gap-1 border-none bg-transparent px-2 text-foreground hover:text-foreground hover:bg-accent/10" 
          : "w-full"
        } 
        aria-label={t("language.label")}
      >
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