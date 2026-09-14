export type EmployeStatut = "actif" | "inactif"

/**
 * Member of staff involved in the farm circuit. Kept deliberately minimal: the
 * record exists to support payroll deductions, not to manage human resources.
 */
export interface Employe {
  id: string
  nom: string
  fonction: string
  departement: string
  matriculeUaz?: string
  /**
   * Client record used when this employee buys from the farm. It links their
   * purchases to their payroll deductions.
   */
  clientId?: string
  statut: EmployeStatut
}
