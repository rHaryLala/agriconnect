import { useMemo } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { AlertCircle, AlertTriangle, CircleCheck } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { formatNumber } from "@/lib/format"

export function StockAlertsTab() {
  const { t } = useTranslation()
  const { articles, movements } = useStockStore()

  const rows = useMemo(
    () =>
      articles.map((a) => {
        const current = computeCurrentStock(a, movements)
        return { article: a, current, status: getStockStatus(current, a.seuilCritique) }
      }),
    [articles, movements]
  )

  const critiques = rows.filter((r) => r.status === "critique")
  const bas = rows.filter((r) => r.status === "bas")
  const ok = rows.filter((r) => r.status === "ok")

  function handleOrder(nom: string) {
    toast.info(t("stock.alerts.orderToast", { name: nom }))
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={AlertCircle} label={t("stock.alerts.statCritical")} value={formatNumber(critiques.length)} tone={critiques.length > 0 ? "destructive" : "success"} hint={t("stock.alerts.statCriticalHint")} />
        <StatCard icon={AlertTriangle} label={t("stock.alerts.statLow")} value={formatNumber(bas.length)} tone={bas.length > 0 ? "warning" : "success"} hint={t("stock.alerts.statLowHint")} />
        <StatCard icon={CircleCheck} label={t("stock.alerts.statOk")} value={formatNumber(ok.length)} tone="success" hint={t("stock.alerts.statOkHint")} />
      </div>

      {critiques.length === 0 && bas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <CircleCheck className="h-8 w-8 text-success" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">{t("stock.alerts.allGoodTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("stock.alerts.allGoodDesc")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {critiques.map(({ article, current }) => (
            <AlertBanner
              key={article.id}
              tone="destructive"
              title={t("stock.alerts.criticalBannerTitle", { name: article.nom })}
              description={t("stock.alerts.bannerDescription", { current: formatNumber(current), threshold: formatNumber(article.seuilCritique), unit: article.unite })}
              action={{ label: t("stock.alerts.orderButton"), onClick: () => handleOrder(article.nom) }}
            />
          ))}
          {bas.map(({ article, current }) => (
            <AlertBanner
              key={article.id}
              tone="warning"
              title={t("stock.alerts.lowBannerTitle", { name: article.nom })}
              description={t("stock.alerts.bannerDescription", { current: formatNumber(current), threshold: formatNumber(article.seuilCritique), unit: article.unite })}
              action={{ label: t("stock.alerts.orderButton"), onClick: () => handleOrder(article.nom) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}