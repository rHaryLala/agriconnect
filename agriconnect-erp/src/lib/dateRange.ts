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
