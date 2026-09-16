import { useTranslation } from "react-i18next"
import { LayoutGrid, List } from "lucide-react"

export type ViewMode = "list" | "grid"

interface ViewToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { t } = useTranslation()

  const modes: { id: ViewMode; icon: typeof List; label: string }[] = [
    { id: "list", icon: List, label: t("common.viewList") },
    { id: "grid", icon: LayoutGrid, label: t("common.viewGrid") },
  ]

  return (
    <div role="group" className="flex shrink-0 rounded-lg border border-border bg-surface p-1">
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-label={label}
          title={label}
          aria-pressed={value === id}
          className={`flex h-8 w-9 items-center justify-center rounded-md transition-colors duration-200 ${
            value === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}
