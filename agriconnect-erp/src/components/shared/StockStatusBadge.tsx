import { useTranslation } from "react-i18next"
import { StatusBadge } from "./StatusBadge"
import type { StockStatus } from "@/lib/stockCalc"

const TONES: Record<StockStatus, "success" | "warning" | "destructive"> = { ok: "success", bas: "warning", critique: "destructive" }
const LABEL_KEYS: Record<StockStatus, string> = { ok: "stock.status.ok", bas: "stock.status.low", critique: "stock.status.critical" }

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const { t } = useTranslation()
  return <StatusBadge label={t(LABEL_KEYS[status])} tone={TONES[status]} />
}