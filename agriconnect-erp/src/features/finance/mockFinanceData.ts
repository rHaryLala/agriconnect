import type { FinanceTransaction } from "@/types/finance"

export const SEED_TRANSACTIONS: FinanceTransaction[] = [
  { id: "t-1", type: "recette", categorie: "Vente d'œufs", montant: 480_000, date: "2026-06-10", description: "Vente hebdomadaire" },
  { id: "t-2", type: "depense", categorie: "Aliments pour animaux", montant: 320_000, date: "2026-06-12", description: "Achat aliments poules" },
  { id: "t-3", type: "recette", categorie: "Vente de lait", montant: 610_000, date: "2026-07-05", description: "Vente mensuelle CAF" },
  { id: "t-4", type: "depense", categorie: "Salaires du personnel", montant: 950_000, date: "2026-07-07", description: "Salaires équipe (4 personnes)" },
  { id: "t-5", type: "depense", categorie: "Transport", montant: 85_000, date: "2026-07-15", description: "Livraison marché" },
  { id: "t-6", type: "recette", categorie: "Vente de récoltes", montant: 1_250_000, date: "2026-08-02", description: "Vente riz - récolte mars" },
  { id: "t-7", type: "depense", categorie: "Entretien du matériel et des installations", montant: 210_000, date: "2026-08-10", description: "Réparation pompe à eau" },
  { id: "t-8", type: "recette", categorie: "Vente d'œufs", montant: 505_000, date: "2026-08-16", description: "Vente hebdomadaire" },
]