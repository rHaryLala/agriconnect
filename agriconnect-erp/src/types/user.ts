export type UserRole = "admin" | "comptable" | "ouvrier" | "magasinier" | "controleur_interne"

export type UserStatus = "actif" | "inactif" | "suspendu"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
  status?: UserStatus
}
