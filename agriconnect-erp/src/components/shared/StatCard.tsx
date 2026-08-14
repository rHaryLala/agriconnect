import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: "primary" | "success" | "warning" | "destructive" | "info"
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-shadow duration-200 hover:shadow-md">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}