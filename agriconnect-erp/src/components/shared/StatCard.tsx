import type { LucideIcon } from "lucide-react"
import { useCountUp } from "@/hooks/useCountUp"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: "primary" | "success" | "warning" | "destructive" | "info"
  animate?: { target: number; format: (n: number) => string }
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary", animate }: StatCardProps) {
  const animatedValue = useCountUp(animate?.target ?? 0)
  const displayValue = animate ? animate.format(animatedValue) : value

  return (
    <div className="glass-surface min-w-0 rounded-xl p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </div>
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold tabular-nums text-foreground sm:text-2xl" title={displayValue}>
        {displayValue}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}