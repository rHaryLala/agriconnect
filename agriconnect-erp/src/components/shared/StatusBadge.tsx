type BadgeTone = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
}

interface StatusBadgeProps {
  label: string
  tone?: BadgeTone
}

export function StatusBadge({ label, tone = "muted" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
  )
}