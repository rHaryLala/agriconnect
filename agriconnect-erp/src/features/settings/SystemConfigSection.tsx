import { useTranslation } from "react-i18next"
import { Switch } from "@/components/ui/switch"
import { useSettingsPreferencesStore } from "./settingsPreferencesStore"

interface SystemConfigSectionProps {
  canEdit: boolean
}

export function SystemConfigSection({ canEdit }: SystemConfigSectionProps) {
  const { t } = useTranslation()
  const { systemBehavior, setSystemBehaviorPref } = useSettingsPreferencesStore()

  const rows: { key: keyof typeof systemBehavior }[] = [
    { key: "autoBackup" },
    { key: "auditLog" },
    { key: "maintenanceMode" },
    { key: "debugMode" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {!canEdit && <p className="text-xs text-muted-foreground">{t("settings.system.readOnlyHint")}</p>}
      <div className="rounded-xl border border-border bg-surface">
        {rows.map(({ key }, i) => (
          <div key={key} className={`flex items-center justify-between gap-4 px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="text-sm font-medium text-foreground">{t(`settings.system.${key}Title`)}</p>
              <p className="text-xs text-muted-foreground">{t(`settings.system.${key}Description`)}</p>
            </div>
            <Switch
              checked={systemBehavior[key]}
              disabled={!canEdit}
              onCheckedChange={(checked) => setSystemBehaviorPref(key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
