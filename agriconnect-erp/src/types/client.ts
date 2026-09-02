export type ClientType = "cafeteria" | "store" | "personnel" | "externe"

export interface Client {
  id: string
  nom: string
  telephone?: string
  type: ClientType
  matriculeUaz?: string
}