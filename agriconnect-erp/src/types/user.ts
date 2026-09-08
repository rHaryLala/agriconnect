export type UserRole = "admin" | "comptable" | "ouvrier" | "magasinier" | "controleur_interne"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
}