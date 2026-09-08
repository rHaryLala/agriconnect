import type { EggCategory } from "./production"

export interface EggSale {
    id: string
    date: string
    clientId: string
    quantities: Record<EggCategory, number>
    responsable: string
    observation?: string
    invoiceId?: string
}