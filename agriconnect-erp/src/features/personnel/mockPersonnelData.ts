import type { Employe } from "@/types/personnel"

export const SEED_EMPLOYES: Employe[] = [
  { id: "emp-1", nom: "Hary Lala", fonction: "Magasinier de la Ferme", departement: "Logistique", matriculeUaz: "UAZ-0231", clientId: "cl-3", statut: "actif" },
  { id: "emp-2", nom: "Naina Rasoa", fonction: "Agent du Store", departement: "Commercial", matriculeUaz: "UAZ-0244", statut: "actif" },
  { id: "emp-3", nom: "Njaka Randria", fonction: "Conducteur", departement: "Transport", matriculeUaz: "UAZ-0198", statut: "actif" },
  { id: "emp-4", nom: "Rakoto Be", fonction: "Contrôleur interne", departement: "Contrôle interne", matriculeUaz: "UAZ-0102", statut: "actif" },
]
