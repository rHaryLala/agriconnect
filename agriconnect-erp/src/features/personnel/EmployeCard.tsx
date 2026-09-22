import { useTranslation } from "react-i18next"
import { Phone, IdCard, Pencil, Trash2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { Employe } from "@/types/personnel"

interface EmployeCardProps {
  employe: Employe
  linkedToClient: boolean
  canEdit: boolean
  onEdit: (employe: Employe) => void
  onDelete: (employe: Employe) => void
}

export function EmployeCard({ employe, linkedToClient, canEdit, onEdit, onDelete }: EmployeCardProps) {
  const { t } = useTranslation()
  const isActive = employe.statut === "actif"

  return (
    <div className="glass-surface animate-fade-in flex h-full flex-col rounded-xl p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{employe.nom}</p>
            <p className="truncate text-xs text-muted-foreground">{employe.fonction || t("personnel.noRole")}</p>
          </div>
        </div>

        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(employe)} aria-label={`${t("common.edit")} ${employe.nom}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(employe)} aria-label={`${t("common.delete")} ${employe.nom}`}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>

      <ul className="mb-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{employe.telephone || "—"}</span>
        </li>
        <li className="flex items-center gap-2">
          <IdCard className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{employe.matriculeUaz || "—"}</span>
        </li>
      </ul>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        <StatusBadge
          label={isActive ? t("personnel.statusActive") : t("personnel.statusInactive")}
          tone={isActive ? "success" : "muted"}
        />
        {employe.departement && <StatusBadge label={employe.departement} tone="info" />}
        {linkedToClient && <StatusBadge label={t("personnel.fromClient")} tone="primary" />}
      </div>
    </div>
  )
}
