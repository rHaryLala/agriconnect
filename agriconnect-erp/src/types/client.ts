export type ClientType = "cafeteria" | "store" | "magasinier" | "personnel" | "externe"

export interface Client {
  id: string
  nom: string
  telephone?: string
  type: ClientType
  matriculeUaz?: string
}