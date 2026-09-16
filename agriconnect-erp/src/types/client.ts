export type ClientType = "cafeteria" | "store" | "production" | "personnel" | "externe"

export const CLIENT_TYPES: ClientType[] = ["cafeteria", "store", "production", "personnel", "externe"]

export interface Client {
  id: string
  nom: string
  telephone?: string
  type: ClientType
  matriculeUaz?: string
  fonction?: string
  departement?: string
}
