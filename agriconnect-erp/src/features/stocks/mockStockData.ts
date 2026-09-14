import type { StockArticle, StockMovement } from "@/types/stock"

export const SEED_ARTICLES: StockArticle[] = [
  { id: "a-oeufs", nom: "Œufs", unite: "unités", quantiteInitiale: 500, seuilCritique: 100 },
  { id: "a-lait", nom: "Lait", unite: "litres", quantiteInitiale: 300, seuilCritique: 80 },
  { id: "a-mais", nom: "Maïs", unite: "kg", quantiteInitiale: 1200, seuilCritique: 200 },
  { id: "a-riz", nom: "Riz", unite: "kg", quantiteInitiale: 800, seuilCritique: 150 },
  { id: "a-soja", nom: "Soja", unite: "kg", quantiteInitiale: 400, seuilCritique: 100 },
  { id: "a-aliments", nom: "Aliments pour animaux", unite: "kg", quantiteInitiale: 250, seuilCritique: 300 },
  { id: "a-provende", nom: "Provende", unite: "kg", quantiteInitiale: 150, seuilCritique: 100 },
  { id: "a-engrais", nom: "Engrais", unite: "kg", quantiteInitiale: 600, seuilCritique: 150 },
  { id: "a-gasoil", nom: "Gasoil", unite: "litres", quantiteInitiale: 400, seuilCritique: 100 },
]

export const SEED_MOVEMENTS: StockMovement[] = [
  { id: "m-1", articleId: "a-oeufs", type: "sortie", emplacement: "ferme", quantite: 80, date: "2026-08-15", destinataire: "Restaurant Chez Lala", numeroBon: "CR-14502", montant: 96_000, observation: "Livraison hebdomadaire" },
  { id: "m-2", articleId: "a-mais", type: "entree", emplacement: "ferme", quantite: 150, date: "2026-08-14", observation: "Réception commande fournisseur" },
  { id: "m-3", articleId: "a-gasoil", type: "entree", emplacement: "ferme", quantite: 200, date: "2026-08-12", observation: "Approvisionnement carburant" },
  { id: "m-4", articleId: "a-gasoil", type: "sortie", emplacement: "ferme", quantite: 45, date: "2026-08-13", destinataire: "Tracteur", observation: "Labour parcelle riz" },
  { id: "m-5", articleId: "a-engrais", type: "sortie", emplacement: "ferme", quantite: 120, date: "2026-08-16", destinataire: "Parcelle maïs", observation: "Épandage" },
]
