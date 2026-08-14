const currencyFormatter = new Intl.NumberFormat("fr-MG", {
  style: "currency",
  currency: "MGA",
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

const numberFormatter = new Intl.NumberFormat("fr-MG")

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

const dateFormatter = new Intl.DateTimeFormat("fr-MG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatDate(date: Date | string): string {
  return dateFormatter.format(typeof date === "string" ? new Date(date) : date)
}