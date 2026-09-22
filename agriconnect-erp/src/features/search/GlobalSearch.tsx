import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { SearchResultsList } from "./SearchResultsList"
import { useSearchController } from "./useSearchController"

export const SEARCH_ROUTE = "/app/recherche"
const DESKTOP_QUERY = "(min-width: 640px)"

export function GlobalSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])
  const { query, setQuery, results, highlighted, setHighlighted, select, onKeyDown, isActive } =
    useSearchController({ onDismiss: close, onSelect: close })

  const openSearch = useCallback(() => {
    if (isDesktop) setOpen(true)
    else navigate(SEARCH_ROUTE)
  }, [isDesktop, navigate])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        openSearch()
      }
    }
    document.addEventListener("keydown", onShortcut)
    return () => document.removeEventListener("keydown", onShortcut)
  }, [openSearch])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={openSearch}
        aria-label={t("search.openLabel")}
        title={t("search.openLabel")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Search className="h-4 w-4" />
      </Button>

      {open && isDesktop && (
        <div className="animate-content-in absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-popover p-2 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={isActive}
              aria-controls="global-search-results"
              aria-label={t("search.openLabel")}
              value={query}
              placeholder={t("search.placeholder")}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              className="h-9 w-full rounded-lg border border-border bg-background/60 pl-8 pr-8 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label={t("search.close")}
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {isActive ? (
            <div id="global-search-results" role="listbox" className="mt-2 max-h-[60vh] overflow-y-auto">
              <SearchResultsList
                results={results}
                query={query}
                highlighted={highlighted}
                onHighlight={setHighlighted}
                onSelect={select}
              />
            </div>
          ) : (
            <p className="px-2 py-3 text-xs text-muted-foreground">{t("search.hint")}</p>
          )}
        </div>
      )}
    </div>
  )
}
