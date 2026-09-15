import type { EngraisApplication } from "@/types/production"

export function inPeriode(application: EngraisApplication, startIso: string, endIso: string): boolean {
  return application.date >= startIso && application.date <= endIso
}

export function totalEngrais(applications: EngraisApplication[], startIso: string, endIso: string): number {
  return applications.filter((a) => inPeriode(a, startIso, endIso)).reduce((sum, a) => sum + a.quantiteKg, 0)
}

export interface EngraisTotal {
  cle: string
  quantiteKg: number
  applications: number
}

function groupBy(
  applications: EngraisApplication[],
  startIso: string,
  endIso: string,
  key: (a: EngraisApplication) => string
): EngraisTotal[] {
  const totals = new Map<string, EngraisTotal>()
  for (const application of applications) {
    if (!inPeriode(application, startIso, endIso)) continue
    const cle = key(application)
    const total = totals.get(cle) ?? { cle, quantiteKg: 0, applications: 0 }
    total.quantiteKg += application.quantiteKg
    total.applications += 1
    totals.set(cle, total)
  }
  return [...totals.values()].sort((a, b) => b.quantiteKg - a.quantiteKg)
}

export function totauxParCulture(applications: EngraisApplication[], startIso: string, endIso: string): EngraisTotal[] {
  return groupBy(applications, startIso, endIso, (a) => a.culture)
}

export function totauxParTypeEngrais(applications: EngraisApplication[], startIso: string, endIso: string): EngraisTotal[] {
  return groupBy(applications, startIso, endIso, (a) => a.typeEngrais)
}
