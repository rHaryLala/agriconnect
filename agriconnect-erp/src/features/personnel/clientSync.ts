import type { Client } from "@/types/client"
import type { Employe } from "@/types/personnel"
import { usePersonnelStore } from "./personnelStore"
import { newId } from "@/lib/id"

function matches(employe: Employe, client: Client): boolean {
  if (employe.clientId) return employe.clientId === client.id
  if (client.matriculeUaz && employe.matriculeUaz) return employe.matriculeUaz === client.matriculeUaz
  return employe.nom.trim().toLowerCase() === client.nom.trim().toLowerCase()
}

function fieldsFrom(client: Client, previous?: Employe): Omit<Employe, "id"> {
  return {
    nom: client.nom,
    fonction: client.fonction?.trim() || previous?.fonction || "",
    departement: client.departement?.trim() || previous?.departement || "",
    telephone: client.telephone,
    matriculeUaz: client.matriculeUaz,
    clientId: client.id,
    statut: "actif",
  }
}

export function syncEmployeFromClient(client: Client): void {
  const store = usePersonnelStore.getState()
  store.ensureSeeded()

  const { employes } = usePersonnelStore.getState()
  const existing = employes.find((employe) => matches(employe, client))

  if (existing) {
    usePersonnelStore.setState({
      employes: employes.map((employe) =>
        employe.id === existing.id ? { ...fieldsFrom(client, existing), id: existing.id } : employe,
      ),
    })
    return
  }

  usePersonnelStore.setState({
    employes: [...employes, { ...fieldsFrom(client), id: newId("emp") }],
  })
}

export function deactivateEmployeForClient(clientId: string): void {
  const { employes } = usePersonnelStore.getState()
  if (!employes.some((employe) => employe.clientId === clientId)) return

  usePersonnelStore.setState({
    employes: employes.map((employe) =>
      employe.clientId === clientId ? { ...employe, statut: "inactif" } : employe,
    ),
  })
}
