import { useTranslation } from "react-i18next"
import { Phone, IdCard, Pencil, Trash2, Handshake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CLIENT_TYPE_LABEL_KEYS, CLIENT_TYPE_TONES } from "./clientLabels"
import type { Client } from "@/types/client"

interface ClientCardProps {
  client: Client
  canEdit: boolean
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientCard({ client, canEdit, onEdit, onDelete }: ClientCardProps) {
  const { t } = useTranslation()

  return (
    <div className="glass-surface animate-fade-in flex h-full flex-col rounded-xl p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Handshake className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{client.nom}</p>
            <StatusBadge label={t(CLIENT_TYPE_LABEL_KEYS[client.type])} tone={CLIENT_TYPE_TONES[client.type]} />
          </div>
        </div>

        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(client)} aria-label={`${t("common.edit")} ${client.nom}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(client)} aria-label={`${t("common.delete")} ${client.nom}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      <ul className="mt-auto flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{client.telephone || "—"}</span>
        </li>
        {client.type === "personnel" && (
          <li className="flex items-center gap-2">
            <IdCard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{client.matriculeUaz || "—"}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
