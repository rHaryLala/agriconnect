import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react"

interface Tab {
  id: string
  label: string
  badge?: number
}

interface SimpleTabsProps {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  trailing?: ReactNode
}

interface IndicatorRect {
  left: number
  top: number
  width: number
}

const INDICATOR_INSET = 12

export function SimpleTabs({ tabs, activeId, onChange, trailing }: SimpleTabsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null)

  const measure = useCallback(() => {
    const list = listRef.current
    const button = buttonRefs.current.get(activeId)
    if (!list || !button) {
      setIndicator(null)
      return
    }
    // Retrait horizontal de 12px de chaque côté : reprend exactement la
    // géométrie de l'ancien soulignement, qui était posé en `inset-x-3`.
    setIndicator({
      left: button.offsetLeft + INDICATOR_INSET,
      top: button.offsetTop + button.offsetHeight,
      width: Math.max(button.offsetWidth - INDICATOR_INSET * 2, 0),
    })
  }, [activeId])

  useLayoutEffect(() => {
    measure()
    const list = listRef.current
    if (!list || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [measure, tabs])

  return (
    <div ref={listRef} role="tablist" className="relative flex flex-wrap items-center gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(node) => {
            if (node) buttonRefs.current.set(tab.id, node)
            else buttonRefs.current.delete(tab.id)
          }}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-1.5 rounded-t-md px-4 py-2.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 ${
            activeId === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          {!!tab.badge && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {tab.badge}
            </span>
          )}
        </button>
      ))}

      {indicator && (
        <span
          aria-hidden
          className="pointer-events-none absolute h-0.5 rounded-full bg-primary transition-[transform,width] duration-300 ease-out"
          style={{
            width: `${indicator.width}px`,
            transform: `translate3d(${indicator.left}px, ${indicator.top - 1}px, 0)`,
            left: 0,
            top: 0,
          }}
        />
      )}

      {trailing}
    </div>
  )
}
