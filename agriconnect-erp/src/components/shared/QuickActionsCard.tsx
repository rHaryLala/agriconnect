import { ChevronRight, type LucideIcon } from "lucide-react"

export interface QuickAction {
  icon: LucideIcon
  label: string
  onClick: () => void
  tone?: "primary" | "success" | "warning" | "destructive" | "info"
}

const toneClasses: Record<NonNullable<QuickAction["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

interface QuickActionsCardProps {
  title?: string
  actions: QuickAction[]
}

export function QuickActionsCard({ title = "Actions rapides", actions }: QuickActionsCardProps) {
  return (
    <div className="glass-surface rounded-xl p-4 shadow-sm sm:p-5">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {actions.map(({ icon: Icon, label, onClick, tone = "primary" }) => (
          <li key={label}>
            <button
              type="button"
              onClick={onClick}
              className="group flex min-h-[44px] w-full items-center gap-3 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-background"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="flex-1 truncate font-medium text-foreground">{label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}