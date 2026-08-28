import { useMemo } from "react"
import { Egg, Milk, Bird, Wheat, Plus, Syringe, MapPin } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { useProductionStore } from "./productionStore"
import { formatDate, formatNumber } from "@/lib/format"
import { hasAlertKeyword } from "@/lib/alerts"

function totalPoules(cages: { nbPoules: number }[]): number {
  return cages.reduce((sum, c) => sum + c.nbPoules, 0)
}
function totalTraite(traites: { matin: number; soir: number }[]): number {
  return traites.reduce((sum, t) => sum + t.matin + t.soir, 0)
}

const MOCK_EVENTS = [
  { icon: Wheat, label: "Récolte maïs — Parcelle P02", when: "Dans 18j" },
  { icon: Syringe, label: "Vaccination Bande C — 1000 poules", when: "Dans 5j" },
  { icon: Bird, label: "Livraison aliments — 2t farine de soja", when: "Demain" },
]

interface ProductionOverviewTabProps {
  onGoToTab: (tabId: string) => void
}

export function ProductionOverviewTab({ onGoToTab }: ProductionOverviewTabProps) {
  const { poules, vaches, kuroiler, cultures } = useProductionStore()

  const latestPoule = poules[0]
  const latestVache = vaches[0]
  const latestKuroiler = kuroiler[0]
  const surfaceTotale = cultures.reduce((sum, c) => sum + c.surfaceHa, 0)

  const alerts = useMemo(() => {
    const found: { title: string; description: string }[] = []
    if (latestPoule && hasAlertKeyword(latestPoule.observation)) {
      found.push({ title: "Alerte — Poules pondeuses", description: latestPoule.observation })
    }
    if (latestVache && hasAlertKeyword(latestVache.suiviSanitaire)) {
      found.push({ title: "Alerte — Vaches laitières", description: latestVache.suiviSanitaire })
    }
    return found
  }, [latestPoule, latestVache])

  const chartData = useMemo(() => {
    const dates = new Set<string>()
    poules.forEach((p) => dates.add(p.date))
    vaches.forEach((v) => dates.add(v.date))
    return Array.from(dates)
      .sort()
      .map((date) => {
        const p = poules.find((x) => x.date === date)
        return { label: formatDate(date), value: p?.oeufsProduits ?? 0 }
      })
  }, [poules])

  const actions: QuickAction[] = [
    { icon: Plus, label: "Saisir production pondeuses", onClick: () => onGoToTab("poules"), tone: "warning" },
    { icon: Milk, label: "Enregistrer collecte lait", onClick: () => onGoToTab("vaches"), tone: "info" },
    { icon: MapPin, label: "Mettre à jour parcelle", onClick: () => onGoToTab("agriculture"), tone: "success" },
    { icon: Syringe, label: "Saisir soin vétérinaire", onClick: () => onGoToTab("vaches"), tone: "destructive" },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Egg} label="Œufs / jour" value={latestPoule ? formatNumber(latestPoule.oeufsProduits) : "—"} tone="warning" hint="Poules pondeuses" />
        <StatCard icon={Milk} label="Lait / jour" value={latestVache ? `${formatNumber(totalTraite(latestVache.traites))} L` : "—"} tone="info" hint="Vaches laitières" />
        <StatCard icon={Bird} label="Kuroiler — poussins" value={latestKuroiler ? formatNumber(latestKuroiler.poussinsVendus) : "—"} tone="primary" hint="Dernier relevé" />
        <StatCard icon={Wheat} label="Surfaces cultivées" value={`${formatNumber(surfaceTotale)} ha`} tone="success" hint={`${cultures.length} entrées actives`} />
        <StatCard icon={Egg} label="Effectif pondeuses" value={latestPoule ? formatNumber(totalPoules(latestPoule.cages)) : "—"} tone="warning" hint="Toutes cages" />
      </div>

      {alerts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {alerts.map((a) => (
            <AlertBanner key={a.title} tone="warning" title={a.title} description={a.description} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">Production d'œufs — historique disponible</p>
          <MiniAreaChart data={chartData} color="#F59E0B" formatValue={(n) => `${formatNumber(n)} œufs`} />
          {chartData.length < 3 && (
            <p className="mt-2 text-xs text-muted-foreground">Peu de relevés pour l'instant — le graphique s'enrichit au fil des saisies.</p>
          )}
        </div>
        <QuickActionsCard actions={actions} />
      </div>

      <div className="glass-surface mt-6 rounded-xl p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Prochains événements</p>
        <ul className="flex flex-col gap-3">
          {MOCK_EVENTS.map(({ icon: Icon, label, when }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="flex-1 truncate text-sm text-foreground">{label}</span>
              <span className="shrink-0 text-xs font-medium text-primary">{when}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">⚠️ Section illustrative — pas encore de module calendrier réel.</p>
      </div>
    </div>
  )
}