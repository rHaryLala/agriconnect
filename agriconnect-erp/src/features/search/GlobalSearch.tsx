import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Search, X } from "lucide-react"
import { useGlobalSearch, SEARCH_GROUPS, type SearchResult } from "./useGlobalSearch"

export function GlobalSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const results = useGlobalSearch(query)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onShortcut)
    return () => document.removeEventListener("keydown", onShortcut)
  }, [])

  function select(result: SearchResult) {
    navigate(result.to)
    setOpen(false)
    setQuery("")
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (results.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlighted((index) => (index + 1) % results.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlighted((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const result = results[Math.min(highlighted, results.length - 1)]
      if (result) select(result)
    }
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 sm:max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-label={t("search.openLabel")}
        value={query}
        placeholder={t("search.placeholder")}
        onChange={(event) => {
          setQuery(event.target.value)
          setHighlighted(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
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

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="animate-content-in absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-foreground">{t("search.noResults", { query: query.trim() })}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("search.noResultsHint")}</p>
            </div>
          ) : (
            SEARCH_GROUPS.map((group) => {
              const groupResults = results.filter((result) => result.group === group)
              if (groupResults.length === 0) return null

              return (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t(`search.groups.${group}`)}
                  </p>
                  <ul>
                    {groupResults.map((result) => {
                      const index = results.indexOf(result)
                      const Icon = result.icon
                      return (
                        <li key={result.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={index === highlighted}
                            onMouseEnter={() => setHighlighted(index)}
                            onClick={() => select(result)}
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
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
