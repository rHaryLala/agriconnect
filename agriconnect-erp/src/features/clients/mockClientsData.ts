import type { Client } from "@/types/client"

export const SEED_CLIENTS: Client[] = [
  { id: "cl-2", nom: "Store", type: "store" },
  { id: "cl-1", nom: "Cafétéria", type: "cafeteria" },
  { id: "cl-6", nom: "Production", type: "production" },
  { id: "cl-3", nom: "Hary Lala", type: "personnel", matriculeUaz: "UAZ-0231", telephone: "034 12 345 67", fonction: "Magasinier de la Ferme", departement: "Logistique" },
  { id: "cl-4", nom: "Restaurant LESOA Hideout", type: "externe", telephone: "032 98 765 43" },
]
