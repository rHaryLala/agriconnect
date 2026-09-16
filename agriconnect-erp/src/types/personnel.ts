export type EmployeStatut = "actif" | "inactif"

export interface Employe {
  id: string
  nom: string
  fonction: string
  departement: string
  telephone?: string
  matriculeUaz?: string
  clientId?: string
  statut: EmployeStatut
}
