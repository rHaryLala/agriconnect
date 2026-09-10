import { currentRegion } from "@/features/settings/regionStore"

const currencyCache = new Map<string, Intl.NumberFormat>()
const numberCache = new Map<string, Intl.NumberFormat>()
const dateCache = new Map<string, Intl.DateTimeFormat>()
const monthCache = new Map<string, Intl.DateTimeFormat>()

function cached<T>(cache: Map<string, T>, key: string, build: () => T): T {
  let value = cache.get(key)
  if (!value) {
    value = build()
    cache.set(key, value)
  }
  return value
}

export function formatCurrency(amount: number): string {
  const { locale, currency } = currentRegion()
  return cached(currencyCache, `${locale}-${currency}`, () =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 })
  ).format(amount)
}

export function formatNumber(value: number): string {
  const { locale } = currentRegion()
  return cached(numberCache, locale, () => new Intl.NumberFormat(locale)).format(value)
}

export function formatMonthLabel(isoMonth: string): string {
  const { locale } = currentRegion()
  return cached(monthCache, locale, () => new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" })).format(
    new Date(`${isoMonth}-01`)
  )
}

export function formatDate(date: Date | string): string {
  const { locale } = currentRegion()
  return cached(dateCache, locale, () =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" })
  ).format(typeof date === "string" ? new Date(date) : date)
}

export function formatDateTime(date: Date | string): string {
  const { locale } = currentRegion()
  return cached(dateCache, `${locale}-dt`, () =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  ).format(typeof date === "string" ? new Date(date) : date)
}
