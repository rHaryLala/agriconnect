import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ViewToggle, type ViewMode } from "./ViewToggle"

export interface ToolbarFilter {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

interface ListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ToolbarFilter[]
  view?: { value: ViewMode; onChange: (value: ViewMode) => void }
  actions?: ReactNode
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  view,
  actions,
}: ListToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="relative min-w-0 flex-1 basis-full sm:basis-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder ?? t("common.searchPlaceholder")}
          aria-label={searchPlaceholder ?? t("common.searchPlaceholder")}
          className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filters.map((filter) => (
        <Select key={filter.id} value={filter.value} onValueChange={(value) => filter.onChange(value ?? filter.value)}>
          <SelectTrigger aria-label={filter.label} className="h-10 w-full sm:w-44">
            <SelectValue placeholder={filter.label}>
              {(value: string | null) => filter.options.find((o) => o.value === value)?.label ?? filter.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {view && <ViewToggle value={view.value} onChange={view.onChange} />}
        {actions}
      </div>
    </div>
  )
}
