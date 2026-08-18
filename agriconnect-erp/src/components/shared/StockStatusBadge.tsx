import { StatusBadge } from "./StatusBadge"
import type { StockStatus } from "@/lib/stockCalc"

const LABELS: Record<StockStatus, string> = { ok: "OK", bas: "Stock bas", critique: "Critique" }
const TONES: Record<StockStatus, "success" | "warning" | "destructive"> = { ok: "success", bas: "warning", critique: "destructive" }

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return <StatusBadge label={LABELS[status]} tone={TONES[status]} />
}