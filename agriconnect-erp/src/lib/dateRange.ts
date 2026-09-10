export function endOfPreviousMonth(dateIso: string): string {
  const d = new Date(dateIso)
  d.setDate(0)
  return d.toISOString().slice(0, 10)
}

export function startOfMonth(dateIso: string): string {
  return dateIso.slice(0, 8) + "01"
}
