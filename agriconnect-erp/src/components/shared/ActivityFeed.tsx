import type { LucideIcon } from "lucide-react"

export interface ActivityItem {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
  time: string
  tone?: "primary" | "success" | "warning" | "destructive" | "info"
}

const toneClasses: Record<NonNullable<ActivityItem["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

interface ActivityFeedProps {
  title?: string
  items: ActivityItem[]
  onViewAll?: () => void
}

export function ActivityFeed({ title = "Activité récente", items, onViewAll }: ActivityFeedProps) {
  return (
    <div className="glass-surface rounded-xl p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {onViewAll && (
          <button type="button" onClick={onViewAll} className="text-xs font-medium text-primary hover:underline">
            Voir tout
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Aucune activité récente.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(({ id, icon: Icon, title: itemTitle, subtitle, time, tone = "primary" }) => (
            <li key={id} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  <span className="font-medium">{itemTitle}</span>{" "}
                  <span className="text-xs text-muted-foreground">{time}</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}