export type UserRole = "admin" | "finance_commercial" | "ouvrier"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
}