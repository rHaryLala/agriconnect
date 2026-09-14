export type ClientType = "cafeteria" | "store" | "production" | "personnel" | "externe"

export const CLIENT_TYPES: ClientType[] = ["cafeteria", "store", "production", "personnel", "externe"]

/**
 * Internal destinations belong to the farm circuit. Deliveries towards them are
 * tracked like sales but settle as inter-location debt.
 *
 * The storekeeper is deliberately absent: it is a role and a stock location on
 * the Ferme -> Magasinier -> Store circuit, never a party a sale is billed to.
 */
const INTERNAL_CLIENT_TYPES: ClientType[] = ["cafeteria", "store", "production"]

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