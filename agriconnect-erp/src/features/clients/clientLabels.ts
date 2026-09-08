import type { ClientType } from "@/types/client"

export const CLIENT_TYPE_LABEL_KEYS: Record<ClientType, string> = {
  cafeteria: "clients.types.cafeteria",
  store: "clients.types.store",
  personnel: "clients.types.personnel",
  externe: "clients.types.externe",
}

export const CLIENT_TYPE_TONES: Record<ClientType, "primary" | "info" | "success" | "warning"> = {
  cafeteria: "primary",
  store: "info",
  personnel: "success",
  externe: "warning",
}