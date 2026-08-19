import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Skeleton } from "./Skeleton"
import { EmptyState } from "./EmptyState"
import type { RowTone } from "@/lib/alerts"

export interface DataTableColumn<T> {
  key: string
  label: string
  render: (row: T) => ReactNode
  className?: string
  sticky?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  rowTone?: (row: T) => RowTone
}

const TONE_BG: Record<NonNullable<RowTone>, string> = {
  critical: "bg-destructive/5 hover:bg-destructive/10",
  warning: "bg-warning/5 hover:bg-warning/10",
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyIcon,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  rowTone,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                    col.sticky ? "sticky right-0 z-10 bg-background shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)]" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              rows.map((row) => {
                const tone = rowTone?.(row) ?? null
                const toneClass = tone ? TONE_BG[tone] : ""
                const stickyBg = tone === "critical" ? "bg-destructive/5" : tone === "warning" ? "bg-warning/5" : "bg-surface"
                return (
                  <tr key={rowKey(row)} className={`group border-b border-border transition-colors last:border-0 hover:bg-background ${toneClass}`}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap px-4 py-3 ${col.className ?? ""} ${
                          col.sticky ? `sticky right-0 z-10 ${stickyBg} shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)] group-hover:bg-background` : ""
                        }`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && rows.length === 0 && (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}