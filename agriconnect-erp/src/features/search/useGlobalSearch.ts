import { useEffect, useMemo } from "react"
import { Handshake, Truck, IdCard, Package, type LucideIcon } from "lucide-react"
import { useClientsStore } from "@/features/clients/clientsStore"
import { useFournisseursStore } from "@/features/fournisseurs/fournisseursStore"
import { usePersonnelStore } from "@/features/personnel/personnelStore"
import { useStockStore } from "@/features/stocks/stockStore"
import { useEffectivePermissions } from "@/hooks/usePermission"
import { levelFromPermissions, type ModuleKey } from "@/lib/permissions"

export type SearchGroup = "clients" | "fournisseurs" | "personnel" | "stock"

export interface SearchResult {
  id: string
  group: SearchGroup
  label: string
  hint?: string
  to: string
  icon: LucideIcon
}

const GROUP_MODULE: Record<SearchGroup, ModuleKey> = {
  clients: "clients",
  fournisseurs: "finance",
  personnel: "personnel",
  stock: "stock",
}

export const GROUP_ICONS: Record<SearchGroup, LucideIcon> = {
  clients: Handshake,
  fournisseurs: Truck,
  personnel: IdCard,
  stock: Package,
}

export const SEARCH_GROUPS: SearchGroup[] = ["clients", "fournisseurs", "personnel", "stock"]

const MAX_PER_GROUP = 5
export const MIN_QUERY_LENGTH = 2

function contains(haystack: string | undefined, needle: string): boolean {
  return !!haystack && haystack.toLowerCase().includes(needle)
}

export function useGlobalSearch(query: string): SearchResult[] {
  const permissions = useEffectivePermissions()

  const { clients, fetchAll: fetchClients } = useClientsStore()
  const { fournisseurs, fetchAll: fetchFournisseurs } = useFournisseursStore()
  const { employes, fetchAll: fetchPersonnel } = usePersonnelStore()
  const { articles, fetchAll: fetchStock } = useStockStore()

  useEffect(() => {
    fetchClients()
    fetchFournisseurs()
    fetchPersonnel()
    fetchStock()
  }, [fetchClients, fetchFournisseurs, fetchPersonnel, fetchStock])

  const visible = useMemo(
    () => SEARCH_GROUPS.filter((group) => levelFromPermissions(permissions, GROUP_MODULE[group]) !== "none"),
    [permissions],
  )

  return useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (needle.length < MIN_QUERY_LENGTH) return []

    const allowed = new Set(visible)
    const results: SearchResult[] = []

    if (allowed.has("clients")) {
      for (const client of clients) {
        if (contains(client.nom, needle) || contains(client.telephone, needle) || contains(client.matriculeUaz, needle)) {
          results.push({
            id: `client-${client.id}`,
            group: "clients",
            label: client.nom,
            hint: client.telephone ?? client.matriculeUaz,
            to: "/app/clients",
            icon: GROUP_ICONS.clients,
          })
        }
      }
    }

    if (allowed.has("fournisseurs")) {
      for (const fournisseur of fournisseurs) {
        const hit =
          contains(fournisseur.nom, needle) ||
          contains(fournisseur.contact, needle) ||
          fournisseur.produits.some((produit) => contains(produit, needle))
        if (hit) {
          results.push({
            id: `fournisseur-${fournisseur.id}`,
            group: "fournisseurs",
            label: fournisseur.nom,
            hint: fournisseur.contact,
            to: `/app/fournisseurs/${fournisseur.id}`,
            icon: GROUP_ICONS.fournisseurs,
          })
        }
      }
    }

    if (allowed.has("personnel")) {
      for (const employe of employes) {
        const hit =
          contains(employe.nom, needle) ||
          contains(employe.fonction, needle) ||
          contains(employe.departement, needle) ||
          contains(employe.matriculeUaz, needle)
        if (hit) {
          results.push({
            id: `employe-${employe.id}`,
            group: "personnel",
            label: employe.nom,
            hint: employe.fonction || employe.departement || undefined,
            to: "/app/personnel",
            icon: GROUP_ICONS.personnel,
          })
        }
      }
    }

    if (allowed.has("stock")) {
      for (const article of articles) {
        if (contains(article.nom, needle) || contains(article.unite, needle)) {
          results.push({
            id: `article-${article.id}`,
            group: "stock",
            label: article.nom,
            hint: article.unite,
            to: "/app/stocks",
            icon: GROUP_ICONS.stock,
          })
        }
      }
    }

    return SEARCH_GROUPS.flatMap((group) => results.filter((result) => result.group === group).slice(0, MAX_PER_GROUP))
  }, [query, visible, clients, fournisseurs, employes, articles])
}
