import { useCallback } from "react"
import { useSearchParams } from "react-router"

export function useTabParam(defaultTab: string, allowed?: string[]): [string, (tab: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get("tab")
  const active = requested && (!allowed || allowed.includes(requested)) ? requested : defaultTab

  const setActive = useCallback(
    (tab: string) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params)
          if (tab === defaultTab) next.delete("tab")
          else next.set("tab", tab)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, defaultTab],
  )

  return [active, setActive]
}
