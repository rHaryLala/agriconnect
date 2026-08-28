import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Sprout, Package, ArrowLeftRight, AlertTriangle, Plus, Syringe, MapPin } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatNumber, formatMonthLabel } from "@/lib/format"
import { useStockStore } from "@/features/stocks/stockStore"
import { useProductionStore } from "@/features/production/productionStore"
import { computeHarvestTrend, computeMonthlyHarvestSeries, computeStockAlertsSummary, computeMovementsLastDays } from "./dashboardCalc"

export function OuvrierDashboardView() {
  const navigate = useNavigate()
  const { articles, movements, fetchAll: fetchStock } = useStockStore()
  const { cultures, fetchAll: fetchProduction } = useProductionStore()

  useEffect(() => {
    fetchStock()
    fetchProduction()
  }, [fetchStock, fetchProduction])

  const stockAlerts = useMemo(() => computeStockAlertsSummary(articles, movements), [articles, movements])
  const harvest = useMemo(() => computeHarvestTrend(cultures), [cultures])
  const harvestChartData = useMemo(
    () => computeMonthlyHarvestSeries(cultures).map((p) => ({ label: formatMonthLabel(p.mois), value: p.recolte })),
    [cultures]
  )
  const culturesActives = useMemo(() => new Set(cultures.map((c) => c.culture)).size, [cultures])
  const mouvements7j = useMemo(() => computeMovementsLastDays(movements, 7), [movements])
  const totalAlerts = stockAlerts.critiqueCount + stockAlerts.basCount

  const actions: QuickAction[] = [
    { icon: Plus, label: "Saisir production pondeuses", onClick: () => navigate("/app/production"), tone: "warning" },
    { icon: Plus, label: "Enregistrer collecte lait", onClick: () => navigate("/app/production"), tone: "info" },
    { icon: MapPin, label: "Mettre à jour parcelle", onClick: () => navigate("/app/production"), tone: "success" },
    { icon: Syringe, label: "Saisir soin vétérinaire", onClick: () => navigate("/app/production"), tone: "destructive" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord — Production</h2>
      <p className="mb-6 text-sm text-muted-foreground">Production, stock, mouvements</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          icon={Sprout}
          label="Récolte ce mois"
          value={`${formatNumber(harvest.currentTotal)} kg`}
          tone="success"
          trend={harvest.previousTotal > 0 ? { value: harvest.changePercent, isPositive: harvest.changePercent >= 0 } : undefined}
        />
        <StatCard icon={Sprout} label="Cultures actives" value={formatNumber(culturesActives)} tone="primary" />
        <StatCard icon={Package} label="Articles en stock" value={formatNumber(articles.length)} tone="primary" />
        <StatCard icon={ArrowLeftRight} label="Mouvements (7j)" value={formatNumber(mouvements7j)} tone="info" />
        <StatCard
          icon={AlertTriangle}
          label="Alertes stock bas"
          value={formatNumber(totalAlerts)}
          tone={stockAlerts.critiqueCount > 0 ? "destructive" : stockAlerts.basCount > 0 ? "warning" : "success"}
        />
      </div>

      {totalAlerts > 0 && stockAlerts.worstArticle && (
        <div className="mt-4">
          <AlertBanner
            tone={stockAlerts.critiqueCount > 0 ? "destructive" : "warning"}
            title={`${stockAlerts.worstArticle.nom} — ${stockAlerts.critiqueCount > 0 ? "stock critique" : "stock bas"}`}
            description={`Actuel : ${formatNumber(stockAlerts.worstArticle.current)} ${stockAlerts.worstArticle.unite} — Seuil : ${formatNumber(stockAlerts.worstArticle.seuilCritique)} ${stockAlerts.worstArticle.unite}.`}
            action={{ label: "Voir le stock", onClick: () => navigate("/app/stocks") }}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-surface rounded-xl p-4 shadow-sm lg:col-span-2">
          <p className="mb-2 text-sm font-medium text-foreground">Récolte — par mois</p>
          <MiniAreaChart data={harvestChartData} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
        </div>
        <QuickActionsCard actions={actions} />
      </div>
    </div>
  )
}