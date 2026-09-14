export type ClientType = "cafeteria" | "store" | "magasinier" | "production" | "personnel" | "externe"

export const CLIENT_TYPES: ClientType[] = ["cafeteria", "store", "magasinier", "production", "personnel", "externe"]

/**
 * Internal destinations belong to the farm circuit (Ferme -> Magasinier -> Store).
 * Deliveries towards them are tracked like sales but settle as inter-location debt.
 */
const INTERNAL_CLIENT_TYPES: ClientType[] = ["cafeteria", "store", "magasinier", "production"]

export function isInternalClientType(type: ClientType): boolean {
  return INTERNAL_CLIENT_TYPES.includes(type)
}

export interface Client {
  id: string
  nom: string
  telephone?: string
  type: ClientType
  matriculeUaz?: string
}