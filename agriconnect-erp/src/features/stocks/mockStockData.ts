import type { StockArticle, StockMovement } from "@/types/stock"

export const SEED_ARTICLES: StockArticle[] = [
  { id: "a-oeufs", nom: "Œufs", unite: "unités", quantiteInitiale: 500, seuilCritique: 100 },
  { id: "a-lait", nom: "Lait", unite: "litres", quantiteInitiale: 300, seuilCritique: 80 },
  { id: "a-mais", nom: "Maïs", unite: "kg", quantiteInitiale: 1200, seuilCritique: 200 },
  { id: "a-riz", nom: "Riz", unite: "kg", quantiteInitiale: 800, seuilCritique: 150 },
  { id: "a-soja", nom: "Soja", unite: "kg", quantiteInitiale: 400, seuilCritique: 100 },
  { id: "a-aliments", nom: "Aliments pour animaux", unite: "kg", quantiteInitiale: 250, seuilCritique: 300 },
]

export const SEED_MOVEMENTS: StockMovement[] = [
  { id: "m-1", articleId: "a-oeufs", type: "sortie", quantite: 80, date: "2026-08-15", destinataire: "Restaurant Chez Lala", numeroBon: "CR-14502", montant: 96_000, observation: "Livraison hebdomadaire" },
  { id: "m-2", articleId: "a-mais", type: "entree", quantite: 150, date: "2026-08-14", observation: "Réception commande fournisseur" },
]