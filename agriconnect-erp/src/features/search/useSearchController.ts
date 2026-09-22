import { useCallback, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router"
import { useGlobalSearch, MIN_QUERY_LENGTH, type SearchResult } from "./useGlobalSearch"

export interface SearchControllerOptions {
  onDismiss?: () => void
  onSelect?: () => void
  replace?: boolean
}

export interface SearchController {
  query: string
  setQuery: (value: string) => void
  results: SearchResult[]
  highlighted: number
  setHighlighted: (index: number) => void
  select: (result: SearchResult) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  isActive: boolean
}

export function useSearchController({ onDismiss, onSelect, replace }: SearchControllerOptions = {}): SearchController {
  const navigate = useNavigate()
  const [query, setQueryValue] = useState("")
  const [highlighted, setHighlighted] = useState(0)

  const results = useGlobalSearch(query)

  const setQuery = useCallback((value: string) => {
    setQueryValue(value)
    setHighlighted(0)
  }, [])

  const select = useCallback(
    (result: SearchResult) => {
      navigate(result.to, { replace })
      setQueryValue("")
      setHighlighted(0)
      onSelect?.()
    },
    [navigate, replace, onSelect],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onDismiss?.()
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
    },
    [results, highlighted, select, onDismiss],
  )

  return {
    query,
    setQuery,
    results,
    highlighted,
    setHighlighted,
    select,
    onKeyDown,
    isActive: query.trim().length >= MIN_QUERY_LENGTH,
  }
}
