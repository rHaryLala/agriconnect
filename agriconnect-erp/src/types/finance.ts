export type TransactionType = "depense" | "recette"

export interface FinanceTransaction {
  id: string
  type: TransactionType
  categorie: string
  montant: number
  date: string
  description: string
}