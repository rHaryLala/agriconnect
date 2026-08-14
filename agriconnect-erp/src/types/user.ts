export type UserRole = "admin" | "finance_commercial" | "operations"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarInitials: string
}