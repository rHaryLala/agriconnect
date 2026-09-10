import { ShieldCheck, Calculator, Tractor, Warehouse, Eye, type LucideIcon } from "lucide-react"
import type { UserRole, UserStatus } from "@/types/user"

export const ROLE_LABEL_KEYS: Record<UserRole, string> = {
  admin: "settings.users.roleAdmin",
  comptable: "settings.users.roleComptable",
  ouvrier: "settings.users.roleOuvrier",
  magasinier: "settings.users.roleMagasinier",
  controleur_interne: "settings.users.roleControleurInterne",
}

export const ROLE_TONES: Record<UserRole, "primary" | "info" | "success" | "warning"> = {
  admin: "primary",
  comptable: "info",
  ouvrier: "success",
  magasinier: "warning",
  controleur_interne: "info",
}

export const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  admin: ShieldCheck,
  comptable: Calculator,
  ouvrier: Tractor,
  magasinier: Warehouse,
  controleur_interne: Eye,
}

/** Tailwind classes for the role avatar tile in Rôles & permissions. */
export const ROLE_ACCENTS: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary",
  comptable: "bg-info/10 text-info",
  ouvrier: "bg-success/10 text-success",
  magasinier: "bg-warning/10 text-warning",
  controleur_interne: "bg-destructive/10 text-destructive",
}

export const STATUS_LABEL_KEYS: Record<UserStatus, string> = {
  actif: "settings.users.statusActive",
  inactif: "settings.users.statusInactive",
  suspendu: "settings.users.statusSuspended",
}

export const STATUS_TONES: Record<UserStatus, "success" | "muted" | "destructive"> = {
  actif: "success",
  inactif: "muted",
  suspendu: "destructive",
}
