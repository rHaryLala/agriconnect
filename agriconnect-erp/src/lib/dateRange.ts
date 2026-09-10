export function endOfPreviousMonth(dateIso: string): string {
  const d = new Date(dateIso)
  d.setDate(0)
  return d.toISOString().slice(0, 10)
}

export function startOfMonth(dateIso: string): string {
  return dateIso.slice(0, 8) + "01"
}

export function currentIsoMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function monthBounds(isoMonth: string): { start: string; end: string } {
  const [year, month] = isoMonth.split("-").map(Number)
  const start = `${isoMonth}-01`
  const end = new Date(year, month, 0).toISOString().slice(0, 10)
  return { start, end }
}

export type Periodicity = "day" | "week" | "month" | "year"

export function currentIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function toIsoDate(date: Date): string {
  // Build the string from local parts: toISOString() would shift the day in UTC+X.
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** Bounds of the period containing `anchorIso` (YYYY-MM-DD). Weeks run Monday to Sunday. */
export function periodBounds(periodicity: Periodicity, anchorIso: string): { start: string; end: string } {
  const [year, month, day] = anchorIso.split("-").map(Number)

  switch (periodicity) {
    case "day":
      return { start: anchorIso, end: anchorIso }
    case "week": {
      const date = new Date(year, month - 1, day)
      const weekday = (date.getDay() + 6) % 7 // Monday = 0
      const monday = new Date(year, month - 1, day - weekday)
      const sunday = new Date(year, month - 1, day - weekday + 6)
      return { start: toIsoDate(monday), end: toIsoDate(sunday) }
    }
    case "month":
      return monthBounds(anchorIso.slice(0, 7))
    case "year":
      return { start: `${year}-01-01`, end: `${year}-12-31` }
  }
}
