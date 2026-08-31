import { useMemo } from "react"
import { useTranslation } from "react-i18next"
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

interface ProductionOverviewTabProps {
  onGoToTab: (tabId: string) => void
}

export function ProductionOverviewTab({ onGoToTab }: ProductionOverviewTabProps) {
  const { t } = useTranslation()
  const { poules, vaches, kuroiler, cultures } = useProductionStore()

  const latestPoule = poules[0]
  const latestVache = vaches[0]
  const latestKuroiler = kuroiler[0]
  const surfaceTotale = cultures.reduce((sum, c) => sum + c.surfaceHa, 0)

  const alerts = useMemo(() => {
    const found: { title: string; description: string }[] = []
    if (latestPoule && hasAlertKeyword(latestPoule.observation)) found.push({ title: t("production.overview.alertPoulesTitle"), description: latestPoule.observation })
    if (latestVache && hasAlertKeyword(latestVache.suiviSanitaire)) found.push({ title: t("production.overview.alertVachesTitle"), description: latestVache.suiviSanitaire })
    return found
  }, [latestPoule, latestVache, t])

  const chartData = useMemo(() => {
    const dates = new Set<string>()
    poules.forEach((p) => dates.add(p.date))
    vaches.forEach((v) => dates.add(v.date))
    return Array.from(dates)
      .sort()
      .map((date) => ({ label: formatDate(date), value: poules.find((x) => x.date === date)?.oeufsProduits ?? 0 }))
  }, [poules, vaches])

  const MOCK_EVENTS = [
    { icon: Wheat, label: t("production.overview.event1"), when: t("production.overview.event1When") },
    { icon: Syringe, label: t("production.overview.event2"), when: t("production.overview.event2When") },
    { icon: Bird, label: t("production.overview.event3"), when: t("production.overview.event3When") },
  ]

  const actions: QuickAction[] = [
    { icon: Plus, label: t("production.poules.statHensCount"), onClick: () => onGoToTab("poules"), tone: "warning" },
    { icon: Milk, label: t("production.vaches.statLastMilk"), onClick: () => onGoToTab("vaches"), tone: "info" },
    { icon: MapPin, label: t("production.agriculture.manageCulturesButton"), onClick: () => onGoToTab("agriculture"), tone: "success" },
    { icon: Syringe, label: t("production.common.observation"), onClick: () => onGoToTab("vaches"), tone: "destructive" },
  ]

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Egg} label={t("production.overview.statEggs")} value={latestPoule ? formatNumber(latestPoule.oeufsProduits) : "—"} tone="warning" hint={t("production.overview.statEggsHint")} />
        <StatCard icon={Milk} label={t("production.overview.statMilk")} value={latestVache ? `${formatNumber(totalTraite(latestVache.traites))} L` : "—"} tone="info" hint={t("production.overview.statMilkHint")} />
        <StatCard icon={Bird} label={t("production.overview.statKuroiler")} value={latestKuroiler ? formatNumber(latestKuroiler.poussinsVendus) : "—"} tone="primary" hint={t("production.overview.statKuroilerHint")} />
        <StatCard icon={Wheat} label={t("production.overview.statSurface")} value={`${formatNumber(surfaceTotale)} ha`} tone="success" hint={t("production.overview.statSurfaceHint", { count: cultures.length })} />
        <StatCard icon={Egg} label={t("production.overview.statHens")} value={latestPoule ? formatNumber(totalPoules(latestPoule.cages)) : "—"} tone="warning" hint={t("production.overview.statHensHint")} />
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
          <p className="mb-2 text-sm font-medium text-foreground">{t("production.overview.chartTitle")}</p>
          <MiniAreaChart data={chartData} color="#F59E0B" formatValue={(n) => `${formatNumber(n)} ${t("production.overview.chartUnit")}`} />
          {chartData.length < 3 && <p className="mt-2 text-xs text-muted-foreground">{t("production.overview.chartHint")}</p>}
        </div>
        <QuickActionsCard actions={actions} />
      </div>

      <div className="glass-surface mt-6 rounded-xl p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">{t("production.overview.eventsTitle")}</p>
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
        <p className="mt-3 text-xs text-muted-foreground">{t("production.overview.eventsDisclaimer")}</p>
      </div>
    </div>
  )
}