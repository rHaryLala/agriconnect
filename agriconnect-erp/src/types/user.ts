export type UserRole = "admin" | "comptable" | "ouvrier"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
}