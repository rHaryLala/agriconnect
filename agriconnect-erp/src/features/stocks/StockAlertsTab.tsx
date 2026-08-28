import { useMemo } from "react"
import { toast } from "sonner"
import { AlertCircle, AlertTriangle, CircleCheck } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { formatNumber } from "@/lib/format"

export function StockAlertsTab() {
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
    toast.info(`Commande à préparer pour "${nom}" — module fournisseurs pas encore disponible.`)
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={AlertCircle} label="Stock critique" value={formatNumber(critiques.length)} tone={critiques.length > 0 ? "destructive" : "success"} hint="Rupture imminente" />
        <StatCard icon={AlertTriangle} label="Stock bas" value={formatNumber(bas.length)} tone={bas.length > 0 ? "warning" : "success"} hint="Sous le seuil" />
        <StatCard icon={CircleCheck} label="Articles OK" value={formatNumber(ok.length)} tone="success" hint="Niveaux normaux" />
      </div>

      {critiques.length === 0 && bas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <CircleCheck className="h-8 w-8 text-success" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">Tout est sous contrôle</p>
          <p className="text-xs text-muted-foreground">Aucun article en dessous de son seuil pour l'instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {critiques.map(({ article, current }) => (
            <AlertBanner
              key={article.id}
              tone="destructive"
              title={`${article.nom} — réapprovisionnement urgent`}
              description={`Actuel : ${formatNumber(current)} ${article.unite} — Seuil : ${formatNumber(article.seuilCritique)} ${article.unite}`}
              action={{ label: "Commander", onClick: () => handleOrder(article.nom) }}
            />
          ))}
          {bas.map(({ article, current }) => (
            <AlertBanner
              key={article.id}
              tone="warning"
              title={`${article.nom} — stock bas`}
              description={`Actuel : ${formatNumber(current)} ${article.unite} — Seuil : ${formatNumber(article.seuilCritique)} ${article.unite}`}
              action={{ label: "Commander", onClick: () => handleOrder(article.nom) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}