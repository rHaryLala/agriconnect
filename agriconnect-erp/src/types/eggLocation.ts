import type { EggCategory } from "./production"

export type EggLocation = "ferme" | "boutique" | "personnel"

export interface EggTransfer {
  id: string
  date: string
  from: EggLocation
  to: EggLocation
  quantities: Record<EggCategory, number>
}