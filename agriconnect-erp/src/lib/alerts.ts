const ALERT_KEYWORDS = ["sous surveillance", "maladie", "malade", "blessure", "boiterie", "urgence"]

export function hasAlertKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return ALERT_KEYWORDS.some((kw) => lower.includes(kw))
}

export type RowTone = "critical" | "warning" | null