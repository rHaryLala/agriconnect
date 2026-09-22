import { useCallback } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchResultsList } from "./SearchResultsList"
import { useSearchController } from "./useSearchController"

export default function SearchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const goBack = useCallback(() => navigate(-1), [navigate])
  const { query, setQuery, results, highlighted, setHighlighted, select, onKeyDown, isActive } =
    useSearchController({ onDismiss: goBack, replace: true })

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-2">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label={t("search.back")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded={isActive}
            aria-controls="search-page-results"
            aria-label={t("search.openLabel")}
            value={query}
            placeholder={t("search.placeholder")}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-8 pr-9 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("search.close")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div id="search-page-results" role="listbox" className="flex-1 overflow-y-auto p-2">
        {isActive ? (
          <SearchResultsList
            results={results}
            query={query}
            highlighted={highlighted}
            onHighlight={setHighlighted}
            onSelect={select}
          />
        ) : (
          <div className="px-3 py-10 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="text-sm text-foreground">{t("search.placeholder")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("search.hint")}</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
