import { Star } from "lucide-react"

interface RatingProps {
  value: number
  max?: number
  showValue?: boolean
  size?: "sm" | "md"
}

const SIZE_CLASS = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
}

export function Rating({ value, max = 5, showValue = true, size = "sm" }: RatingProps) {
  const rounded = Math.round(value * 2) / 2

  return (
    <span className="inline-flex items-center gap-1" title={`${value.toFixed(1)} / ${max}`}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const filled = rounded >= index + 1
          const half = !filled && rounded >= index + 0.5
          return (
            <span key={index} className="relative inline-flex">
              <Star className={`${SIZE_CLASS[size]} text-muted-foreground/35`} strokeWidth={1.75} />
              {(filled || half) && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                  <Star className={`${SIZE_CLASS[size]} fill-warning text-warning`} strokeWidth={1.75} />
                </span>
              )}
            </span>
          )
        })}
      </span>
      {showValue && <span className="text-xs tabular-nums text-muted-foreground">{value.toFixed(1)}</span>}
    </span>
  )
}
