import { useNavigate } from "react-router"
import { Sprout, Package, AlertTriangle, Wallet, TrendingUp, Handshake, Plus, Minus, ArrowDownCircle, FileText, ClipboardList } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard"
import { AlertBanner } from "@/components/shared/AlertBanner"
import { ActivityFeed, type ActivityItem } from "@/components/shared/ActivityFeed"
import { MiniAreaChart } from "@/components/shared/MiniAreaChart"
import { formatCurrency, formatNumber } from "@/lib/format"
import { MOCK_DASHBOARD_DATA as data, MOCK_TRENDS as trends, MOCK_STAT_TRENDS as statTrends } from "./mockDashboardData"

const ACTIVITY: ActivityItem[] = [
  { id: "1", icon: Sprout, title: "Production enregistrée", subtitle: "12 450 œufs — Poulailler A + B", time: "il y a 1h", tone: "success" },
  { id: "2", icon: Package, title: "Livraison reçue", subtitle: "2 t aliments bétail — Fournisseur Agro", time: "il y a 3h", tone: "info" },
  { id: "3", icon: Handshake, title: "Vente confirmée", subtitle: "60 kuroiler — Restaurant Belle Vue", time: "il y a 5h", tone: "primary" },
  { id: "4", icon: AlertTriangle, title: "Alerte stock", subtitle: "Engrais NPK critique — 48 kg restants", time: "hier", tone: "warning" },
]

export function AdminDashboardView() {
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    { icon: Plus, label: "Ajouter production", onClick: () => navigate("/app/production"), tone: "success" },
    { icon: Minus, label: "Ajouter dépense", onClick: () => navigate("/app/finance"), tone: "destructive" },
    { icon: Plus, label: "Ajouter revenu", onClick: () => navigate("/app/finance"), tone: "success" },
    { icon: ArrowDownCircle, label: "Entrée de stock", onClick: () => navigate("/app/stocks"), tone: "info" },
    { icon: FileText, label: "Créer une facture", onClick: () => navigate("/app/clients-fournisseurs"), tone: "warning" },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Tableau de bord</h2>
      <p className="mb-6 text-sm text-muted-foreground">Vue transversale — tous les modules</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={Sprout} label="Récolte ce mois" value="" tone="success" trend={statTrends.harvest} animate={{ target: data.production.harvestThisMonth, format: (n) => `${formatNumber(Math.round(n))} kg` }} />
        <StatCard icon={Package} label="Articles en stock" value="" tone="primary" trend={statTrends.stockItems} animate={{ target: data.stock.totalItems, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={AlertTriangle} label="Alertes stock bas" value="" tone="warning" trend={statTrends.lowStockAlerts} animate={{ target: data.stock.lowStockAlerts, format: (n) => formatNumber(Math.round(n)) }} />
        <StatCard icon={Wallet} label="Chiffre d'affaires" value="" tone="info" animate={{ target: data.finance.revenue, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={TrendingUp} label="Marge nette" value="" tone="success" animate={{ target: data.finance.margin, format: (n) => formatCurrency(Math.round(n)) }} />
        <StatCard icon={Handshake} label="Clients actifs" value="" tone="primary" trend={statTrends.activeParcels} animate={{ target: data.clients.totalClients, format: (n) => formatNumber(Math.round(n)) }} />
      </div>

      <div className="mt-4">
        <AlertBanner
          tone="warning"
          title="2 alertes actives"
          description="Engrais NPK 20-20-0 et Blé semence sous leur seuil critique."
          action={{ label: "Voir le stock", onClick: () => navigate("/app/stocks") }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <div className="glass-surface rounded-xl p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-foreground">Récolte — 6 derniers mois</p>
            <MiniAreaChart data={trends.production} color="#16A34A" formatValue={(n) => `${formatNumber(n)} kg`} />
          </div>
          <div className="glass-surface rounded-xl p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-foreground">Stock — 6 derniers mois</p>
            <MiniAreaChart data={trends.stock} color="#0F8A5F" formatValue={(n) => formatNumber(n)} />
          </div>
        </div>
        <QuickActionsCard actions={actions} />
      </div>

      <div className="mt-6">
        <ActivityFeed items={ACTIVITY} onViewAll={() => navigate("/app/rapports")} />
      </div>
    </div>
  )
}