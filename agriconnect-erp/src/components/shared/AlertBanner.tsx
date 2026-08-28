import { AlertTriangle, AlertCircle, Info, type LucideIcon } from "lucide-react"

interface AlertBannerProps {
  tone: "warning" | "destructive" | "info"
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  icon?: LucideIcon
}

const TONE_STYLES: Record<AlertBannerProps["tone"], { bg: string; text: string; icon: LucideIcon }> = {
  warning: { bg: "bg-warning/10 border-warning/30", text: "text-warning", icon: AlertTriangle },
  destructive: { bg: "bg-destructive/10 border-destructive/30", text: "text-destructive", icon: AlertCircle },
  info: { bg: "bg-info/10 border-info/30", text: "text-info", icon: Info },
}

export function AlertBanner({ tone, title, description, action, icon }: AlertBannerProps) {
  const style = TONE_STYLES[tone]
  const Icon = icon ?? style.icon

  return (
    <div className={`flex animate-content-in items-start gap-3 rounded-xl border px-4 py-3 ${style.bg}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.text}`} />
      <div className="flex-1">
        <p className={`text-sm font-semibold ${style.text}`}>{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`min-h-[36px] shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors duration-200 hover:bg-white/50 ${style.text} border-current`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}