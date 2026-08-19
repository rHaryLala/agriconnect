import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  Pencil,
  X,
} from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable"
import {
  QuickAddDialog,
  type FieldConfig,
} from "@/components/shared/QuickAddDialog"
import { StockMovementDialog } from "./StockMovementDialog"
import { StockStatusBadge } from "@/components/shared/StockStatusBadge"
import { useStockStore } from "./stockStore"
import {
  computeCurrentStock,
  computeRunningBalances,
  getStockStatus,
} from "@/lib/stockCalc"
import {
  formatDate,
  formatNumber,
  formatCurrency,
} from "@/lib/format"
import type { StockMovement } from "@/types/stock"
import type { RowTone } from "@/lib/alerts"

const articleSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  unite: z
    .string()
    .min(1, "Unité requise (ex: kg, litres, unités)"),
  quantiteInitiale: z
    .number({ invalid_type_error: "Nombre requis" })
    .min(0),
  seuilCritique: z
    .number({ invalid_type_error: "Nombre requis" })
    .min(0),
})

type ArticleFormValues = z.infer<typeof articleSchema>

export default function StocksPage() {
  const {
    articles,
    movements,
    isLoading,
    fetchAll,
    addArticle,
    addMovement,
    updateMovement,
    deleteMovement,
  } = useStockStore()

  const [movementOpen, setMovementOpen] = useState(false)
  const [articleOpen, setArticleOpen] = useState(false)
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null)

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const articlesWithStatus = useMemo(
    () =>
      articles.map((a) => {
        const current = computeCurrentStock(a, movements)

        return {
          article: a,
          current,
          status: getStockStatus(
            current,
            a.seuilCritique
          ),
        }
      }),
    [articles, movements]
  )

  const runningBalances = useMemo(() => {
    const merged: Record<string, number> = {}

    articles.forEach((a) =>
      Object.assign(
        merged,
        computeRunningBalances(a, movements)
      )
    )

    return merged
  }, [articles, movements])

  const alertesActives = articlesWithStatus.filter(
    (a) => a.status === "critique"
  ).length

  const filteredMovements = useMemo(
    () =>
      movements.filter((m) => {
        if (dateDebut && m.date < dateDebut) {
          return false
        }

        if (dateFin && m.date > dateFin) {
          return false
        }

        if (criticalOnly) {
          const art = articlesWithStatus.find(
            (a) => a.article.id === m.articleId
          )

          if (!art || art.status !== "critique") {
            return false
          }
        }

        return true
      }),
    [
      movements,
      dateDebut,
      dateFin,
      criticalOnly,
      articlesWithStatus,
    ]
  )

  function openCreateMovement() {
    setEditingMovement(null)
    setMovementOpen(true)
  }

  function openEditMovement(m: StockMovement) {
    setEditingMovement(m)
    setMovementOpen(true)
  }

  async function handleAddMovement(values: Omit<StockMovement, "id">) {
    if (values.type === "sortie") {
      const article = articles.find((a) => a.id === values.articleId)
      if (article) {
        const movementsExcludingCurrent = movements.filter(
          (m) => m.id !== editingMovement?.id
        )
        const current = computeCurrentStock(article, movementsExcludingCurrent)
        if (values.quantite > current) {
          toast.error(
            `Stock insuffisant : ${article.nom} n'a que ${current} ${article.unite} disponible(s).`
          )
          return
        }
      }
    }

    if (editingMovement) {
      await updateMovement(editingMovement.id, values)
      toast.success("Mouvement modifié")
    } else {
      await addMovement(values)
      toast.success("Mouvement enregistré")
    }

    setMovementOpen(false)
    setEditingMovement(null)
  }

  function movementRowTone(m: StockMovement): RowTone {
    const balance = runningBalances[m.id]
    return balance !== undefined && balance < 0 ? "critical" : null
  }

  const articleFields: FieldConfig<ArticleFormValues>[] = [
    {
      type: "text",
      name: "nom",
      label: "Nom de l'article",
      placeholder: "Ex: Farine de maïs",
    },
    {
      type: "text",
      name: "unite",
      label: "Unité",
      placeholder: "kg, litres, unités...",
    },
    {
      type: "number",
      name: "quantiteInitiale",
      label: "Quantité de départ",
    },
    {
      type: "number",
      name: "seuilCritique",
      label: "Seuil critique",
    },
  ]

  const articleColumns: DataTableColumn<
    (typeof articlesWithStatus)[number]
  >[] = [
    {
      key: "nom",
      label: "Article",
      render: (row) => row.article.nom,
    },
    {
      key: "quantite",
      label: "Quantité actuelle",
      render: (row) =>
        `${formatNumber(row.current)} ${row.article.unite}`,
    },
    {
      key: "seuil",
      label: "Seuil critique",
      render: (row) =>
        `${formatNumber(row.article.seuilCritique)} ${row.article.unite}`,
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) => (
        <StockStatusBadge status={row.status} />
      ),
    },
  ]

  const movementColumns: DataTableColumn<StockMovement>[] = [
    {
      key: "date",
      label: "Date",
      render: (m) => formatDate(m.date),
    },
    {
      key: "article",
      label: "Article",
      render: (m) =>
        articles.find(
          (a) => a.id === m.articleId
        )?.nom ?? "—",
    },
    {
      key: "type",
      label: "Type",
      render: (m) => (
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            m.type === "entree"
              ? "text-success"
              : "text-destructive"
          }`}
        >
          {m.type === "entree" ? (
            <ArrowDownCircle className="h-4 w-4" />
          ) : (
            <ArrowUpCircle className="h-4 w-4" />
          )}

          {m.type === "entree"
            ? "Entrée"
            : "Sortie"}
        </span>
      ),
    },
    {
      key: "quantite",
      label: "Quantité",
      render: (m) => formatNumber(m.quantite),
    },
    {
      key: "destinataire",
      label: "Destinataire",
      render: (m) =>
        m.destinataire ? (
          m.destinataire
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },
    {
      key: "bon",
      label: "N° Bon",
      render: (m) =>
        m.numeroBon ? (
          m.numeroBon
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },
    {
      key: "montant",
      label: "Montant",
      render: (m) =>
        m.montant !== undefined ? (
          formatCurrency(m.montant)
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },
    {
      key: "reste",
      label: "Reste",
      render: (m) => {
        const article = articles.find(
          (a) => a.id === m.articleId
        )

        const balance = runningBalances[m.id]

        return balance !== undefined && article
          ? `${formatNumber(balance)} ${article.unite}`
          : "—"
      },
    },
    {
      key: "actions",
      label: "",
      className:
        "sticky right-0 z-10 bg-background text-right",
      sticky: true,
      render: (m) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditMovement(m)}
            aria-label="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              deleteMovement(m.id)
              toast.success("Mouvement supprimé")
            }}
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">
        Stocks
      </h2>

      <p className="mb-6 text-sm text-muted-foreground">
        Entrées, sorties et inventaire
      </p>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          icon={Package}
          label="Articles suivis"
          value={formatNumber(articles.length)}
          tone="primary"
        />

        <button
          type="button"
          onClick={() =>
            setCriticalOnly((v) => !v)
          }
          className="text-left"
        >
          <StatCard
            icon={AlertTriangle}
            label={
              criticalOnly
                ? "Alertes critiques (filtré)"
                : "Alertes critiques"
            }
            value={formatNumber(alertesActives)}
            tone={
              alertesActives > 0
                ? "destructive"
                : "success"
            }
          />
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Inventaire
        </h3>

        <Button
          variant="outline"
          onClick={() => setArticleOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      <DataTable
        columns={articleColumns}
        rows={articlesWithStatus}
        rowKey={(row) => row.article.id}
        isLoading={isLoading}
        emptyIcon={Package}
        emptyTitle="Aucun article"
      />

      <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">
          Mouvements
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) =>
                setDateDebut(e.target.value)
              }
              className="bg-transparent text-sm text-foreground outline-none"
            />

            <span className="text-xs text-muted-foreground">
              →
            </span>

            <input
              type="date"
              value={dateFin}
              onChange={(e) =>
                setDateFin(e.target.value)
              }
              className="bg-transparent text-sm text-foreground outline-none"
            />

            {(dateDebut ||
              dateFin ||
              criticalOnly) && (
              <button
                type="button"
                onClick={() => {
                  setDateDebut("")
                  setDateFin("")
                  setCriticalOnly(false)
                }}
                aria-label="Réinitialiser les filtres"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            onClick={openCreateMovement}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Enregistrer un mouvement
          </Button>
        </div>
      </div>

      <DataTable
        columns={movementColumns}
        rows={filteredMovements}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyIcon={Package}
        emptyTitle="Aucun mouvement"
        emptyDescription="Enregistre la première entrée ou sortie, ou ajuste les filtres ci-dessus."
        rowTone={movementRowTone}
      />

      <StockMovementDialog
        open={movementOpen}
        onOpenChange={setMovementOpen}
        articles={articles}
        editingEntry={editingMovement}
        onSubmit={handleAddMovement}
      />

      <QuickAddDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        title="Nouvel article de stock"
        schema={articleSchema}
        fields={articleFields}
        defaultValues={{
          nom: "",
          unite: "",
          quantiteInitiale: 0,
          seuilCritique: 0,
        }}
        onSubmit={async (values) => {
          await addArticle(values)
          toast.success("Article créé")
        }}
      />
    </div>
  )
}