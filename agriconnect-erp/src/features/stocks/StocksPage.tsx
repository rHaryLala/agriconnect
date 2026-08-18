import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Plus, Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { QuickAddDialog, type FieldConfig } from "@/components/shared/QuickAddDialog"
import { StockStatusBadge } from "@/components/shared/StockStatusBadge"
import { useStockStore } from "./stockStore"
import { computeCurrentStock, getStockStatus } from "@/lib/stockCalc"
import { formatDate, formatNumber } from "@/lib/format"
import type { StockArticle, StockMovement, MovementType } from "@/types/stock"

const movementSchema = z.object({
  articleId: z.string().min(1, "Sélectionne un article"),
  type: z.enum(["entree", "sortie"], { errorMap: () => ({ message: "Sélectionne un type" }) }),
  quantite: z.number({ invalid_type_error: "Nombre requis" }).positive("Doit être positif"),
  date: z.string().min(1, "Date requise"),
  origine: z.string().min(1, "Origine requise (ex: Achat, Vente, Production...)"),
})

type MovementFormValues = z.infer<typeof movementSchema>

const articleSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  unite: z.string().min(1, "Unité requise (ex: kg, litres, unités)"),
  quantiteInitiale: z.number({ invalid_type_error: "Nombre requis" }).min(0),
  seuilCritique: z.number({ invalid_type_error: "Nombre requis" }).min(0),
})

type ArticleFormValues = z.infer<typeof articleSchema>

const articleFields: FieldConfig<ArticleFormValues>[] = [
  { type: "text", name: "nom", label: "Nom de l'article", placeholder: "Ex: Farine de maïs" },
  { type: "text", name: "unite", label: "Unité", placeholder: "kg, litres, unités..." },
  { type: "number", name: "quantiteInitiale", label: "Quantité de départ" },
  { type: "number", name: "seuilCritique", label: "Seuil critique" },
]

export default function StocksPage() {
  const {
    articles,
    movements,
    isLoading,
    fetchAll,
    addArticle,
    addMovement,
    deleteMovement,
  } = useStockStore()

  const [movementOpen, setMovementOpen] = useState(false)
  const [articleOpen, setArticleOpen] = useState(false)

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
          status: getStockStatus(current, a.seuilCritique),
        }
      }),
    [articles, movements]
  )

  const alertesActives = articlesWithStatus.filter(
    (a) => a.status === "critique"
  ).length

  const movementFields: FieldConfig<MovementFormValues>[] = [
    {
      type: "select",
      name: "articleId",
      label: "Article",
      options: articles.map((a) => ({
        value: a.id,
        label: `${a.nom} (${a.unite})`,
      })),
    },
    {
      type: "select",
      name: "type",
      label: "Type de mouvement",
      options: [
        { value: "entree", label: "Entrée" },
        { value: "sortie", label: "Sortie" },
      ],
    },
    { type: "number", name: "quantite", label: "Quantité" },
    { type: "date", name: "date", label: "Date" },
    {
      type: "text",
      name: "origine",
      label: "Origine",
      placeholder: "Achat fournisseur, Vente client, Production...",
    },
  ]

  async function handleAddMovement(values: MovementFormValues) {
    if (values.type === "sortie") {
      const article = articles.find((a) => a.id === values.articleId)

      if (article) {
        const current = computeCurrentStock(article, movements)

        if (values.quantite > current) {
          toast.error(
            `Stock insuffisant : ${article.nom} n'a que ${current} ${article.unite} disponible(s).`
          )

          throw new Error("Stock insuffisant")
        }
      }
    }

    await addMovement(values)
    toast.success("Mouvement enregistré")
  }

  async function handleAddArticle(values: ArticleFormValues) {
    await addArticle(values)
    toast.success("Article créé")
  }

  const articleColumns: DataTableColumn<(typeof articlesWithStatus)[number]>[] = [
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
      render: (row) => <StockStatusBadge status={row.status} />,
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
        articles.find((a) => a.id === m.articleId)?.nom ?? "—",
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
          {m.type === "entree" ? "Entrée" : "Sortie"}
        </span>
      ),
    },
    {
      key: "quantite",
      label: "Quantité",
      render: (m) => formatNumber(m.quantite),
    },
    {
      key: "origine",
      label: "Origine",
      render: (m) => (
        <span className="text-muted-foreground">{m.origine}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (m) => (
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
      ),
    },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Stocks</h2>
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

        <StatCard
          icon={AlertTriangle}
          label="Alertes critiques"
          value={formatNumber(alertesActives)}
          tone={alertesActives > 0 ? "destructive" : "success"}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Inventaire</h3>

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

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mouvements</h3>

        <Button
          onClick={() => setMovementOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Enregistrer un mouvement
        </Button>
      </div>

      <DataTable
        columns={movementColumns}
        rows={movements}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyIcon={Package}
        emptyTitle="Aucun mouvement"
        emptyDescription="Enregistre la première entrée ou sortie avec le bouton ci-dessus."
      />

      <QuickAddDialog
        open={movementOpen}
        onOpenChange={setMovementOpen}
        title="Nouveau mouvement de stock"
        schema={movementSchema}
        fields={movementFields}
        defaultValues={{
          articleId: articles[0]?.id ?? "",
          type: "entree" as MovementType,
          quantite: 0,
          date: new Date().toISOString().slice(0, 10),
          origine: "",
        }}
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
        onSubmit={handleAddArticle}
      />
    </div>
  )
}