import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"
import { useCountUp } from "@/hooks/useCountUp"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: "primary" | "success" | "warning" | "destructive" | "info"
  animate?: { target: number; format: (n: number) => string }
  trend?: { value: number; isPositive: boolean }
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary", animate, trend }: StatCardProps) {
  const animatedValue = useCountUp(animate?.target ?? 0)
  const displayValue = animate ? animate.format(animatedValue) : value

  return (
    <div className="glass-surface min-w-0 rounded-xl p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
              trend.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend.value > 0 ? "+" : ""}
            {trend.value.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="truncate text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold tabular-nums text-foreground sm:text-2xl" title={displayValue}>
        {displayValue}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}