import type { ReactNode } from "react"

interface Tab {
  id: string
  label: string
}

interface SimpleTabsProps {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  trailing?: ReactNode
}

export function SimpleTabs({ tabs, activeId, onChange, trailing }: SimpleTabsProps) {
  return (
    <div role="tablist" className="flex flex-wrap items-center gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            activeId === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          {activeId === tab.id && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 animate-fade-in rounded-full bg-primary" />
          )}
        </button>
      ))}
      {trailing}
    </div>
  )
}