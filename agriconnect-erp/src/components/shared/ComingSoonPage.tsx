import type { LucideIcon } from "lucide-react"

interface ComingSoonPageProps {
  icon: LucideIcon
  title: string
  description: string
}

export function ComingSoonPage({ icon: Icon, title, description }: ComingSoonPageProps) {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{title}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-medium text-foreground">Module en construction</p>
        <p className="max-w-sm text-xs text-muted-foreground">Prévu dans un prochain sprint — reviens bientôt.</p>
      </div>
    </div>
  )
}