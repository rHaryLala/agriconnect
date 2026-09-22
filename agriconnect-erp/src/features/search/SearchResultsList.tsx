import { useTranslation } from "react-i18next"
import { SEARCH_GROUPS, type SearchResult } from "./useGlobalSearch"

interface SearchResultsListProps {
  results: SearchResult[]
  query: string
  highlighted: number
  onHighlight: (index: number) => void
  onSelect: (result: SearchResult) => void
}

interface GroupedResults {
  group: string
  items: SearchResult[]
  offset: number
}

function groupResults(results: SearchResult[]): GroupedResults[] {
  let offset = 0
  const grouped: GroupedResults[] = []

  for (const group of SEARCH_GROUPS) {
    const items = results.filter((result) => result.group === group)
    if (items.length > 0) {
      grouped.push({ group, items, offset })
      offset += items.length
    }
  }

  return grouped
}

export function SearchResultsList({ results, query, highlighted, onHighlight, onSelect }: SearchResultsListProps) {
  const { t } = useTranslation()

  if (results.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <p className="text-sm text-foreground">{t("search.noResults", { query: query.trim() })}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("search.noResultsHint")}</p>
      </div>
    )
  }

  return (
    <>
      {groupResults(results).map(({ group, items, offset }) => (
        <div key={group} className="mb-2 last:mb-0">
          <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t(`search.groups.${group}`)}
          </p>
          <ul>
            {items.map((result, position) => {
              const index = offset + position
              const Icon = result.icon
              return (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === highlighted}
                    onMouseEnter={() => onHighlight(index)}
                    onClick={() => onSelect(result)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                      index === highlighted ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-background"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{result.label}</span>
                      {result.hint && <span className="block truncate text-xs text-muted-foreground">{result.hint}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </>
  )
}
