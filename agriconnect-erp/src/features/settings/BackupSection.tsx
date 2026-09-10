import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { DatabaseBackup, Upload, History, CircleCheck, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { formatDateTime } from "@/lib/format"
import { useBackupHistoryStore, type BackupEntry } from "./backupHistoryStore"

interface BackupSectionProps {
  canEdit: boolean
}

function appStorageSizeKb(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith("agriconnect-")) continue
    total += (localStorage.getItem(key) ?? "").length
  }
  return Math.round((total / 1024) * 10) / 10
}

function collectSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith("agriconnect-")) continue
    snapshot[key] = localStorage.getItem(key) ?? ""
  }
  return snapshot
}

export function BackupSection({ canEdit }: BackupSectionProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { entries, ensureSeeded, recordBackup } = useBackupHistoryStore()
  const [sizeKb, setSizeKb] = useState(appStorageSizeKb)

  useEffect(() => {
    ensureSeeded()
  }, [ensureSeeded])

  const lastBackup = entries.find((e) => e.status === "succes")
  const successRate = entries.length > 0 ? Math.round((entries.filter((e) => e.status === "succes").length / entries.length) * 100) : 0

  function handleExport() {
    const started = performance.now()
    const snapshot = collectSnapshot()
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agriconnect-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    const current = appStorageSizeKb()
    setSizeKb(current)
    recordBackup(current, "manuelle", Math.max(1, Math.round((performance.now() - started) / 1000)))
    toast.success(t("settings.backup.toastExported"))
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const snapshot = JSON.parse(await file.text()) as Record<string, string>
      const keys = Object.keys(snapshot).filter((k) => k.startsWith("agriconnect-"))
      if (keys.length === 0) throw new Error("empty")
      for (const key of keys) localStorage.setItem(key, snapshot[key])
      toast.success(t("settings.backup.toastRestored"))
      window.location.reload()
    } catch {
      toast.error(t("settings.backup.toastRestoreError"))
    }
  }

  const columns: DataTableColumn<BackupEntry>[] = [
    { key: "date", label: t("settings.backup.colDate"), render: (b) => formatDateTime(b.dateIso) },
    { key: "size", label: t("settings.backup.colSize"), render: (b) => `${b.sizeKb} KB` },
    { key: "type", label: t("settings.backup.colType"), render: (b) => t(b.type === "automatique" ? "settings.backup.typeAuto" : "settings.backup.typeManual") },
    {
      key: "duration", label: t("settings.backup.colDuration"),
      render: (b) => (b.durationSeconds === null ? "—" : `${Math.floor(b.durationSeconds / 60)}m ${String(b.durationSeconds % 60).padStart(2, "0")}s`),
    },
    {
      key: "status", label: t("settings.backup.colStatus"),
      render: (b) => <StatusBadge label={t(b.status === "succes" ? "settings.backup.statusSuccess" : "settings.backup.statusError")} tone={b.status === "succes" ? "success" : "destructive"} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={History} label={t("settings.backup.statLastBackup")} value={lastBackup ? formatDateTime(lastBackup.dateIso) : "—"} tone="primary" />
        <StatCard icon={DatabaseBackup} label={t("settings.backup.statTotalSize")} value={`${sizeKb} KB`} tone="info" />
        <StatCard icon={Percent} label={t("settings.backup.statSuccessRate")} value={`${successRate} %`} tone={successRate === 100 ? "success" : "warning"} />
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} className="gap-2">
            <DatabaseBackup className="h-4 w-4" />
            {t("settings.backup.exportButton")}
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            {t("settings.backup.importButton")}
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("settings.backup.hint")}</p>

      <DataTable columns={columns} rows={entries} rowKey={(b) => b.id} isLoading={false} emptyIcon={CircleCheck} emptyTitle={t("settings.backup.emptyTitle")} emptyDescription={t("settings.backup.emptyDescription")} />
    </div>
  )
}
