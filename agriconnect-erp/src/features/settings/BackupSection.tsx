import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { DatabaseBackup, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/shared/StatCard"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"

interface BackupSectionProps {
  canEdit: boolean
}

interface StorageRow {
  key: string
  sizeKb: number
}

function listAppStorageKeys(): StorageRow[] {
  const rows: StorageRow[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith("agriconnect-")) continue
    const value = localStorage.getItem(key) ?? ""
    rows.push({ key, sizeKb: Math.round((value.length / 1024) * 10) / 10 })
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key))
}

export function BackupSection({ canEdit }: BackupSectionProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<StorageRow[]>(listAppStorageKeys)

  const totalKb = rows.reduce((sum, r) => sum + r.sizeKb, 0)

  function handleExport() {
    const snapshot: Record<string, string> = {}
    for (const row of rows) snapshot[row.key] = localStorage.getItem(row.key) ?? ""
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agriconnect-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success(t("settings.backup.toastExported"))
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const snapshot = JSON.parse(text) as Record<string, string>
      const keys = Object.keys(snapshot).filter((k) => k.startsWith("agriconnect-"))
      if (keys.length === 0) throw new Error("empty")
      for (const key of keys) localStorage.setItem(key, snapshot[key])
      toast.success(t("settings.backup.toastRestored"))
      setRows(listAppStorageKeys())
      window.location.reload()
    } catch {
      toast.error(t("settings.backup.toastRestoreError"))
    }
  }

  const columns: DataTableColumn<StorageRow>[] = [
    { key: "key", label: t("settings.backup.colKey"), render: (r) => r.key },
    { key: "size", label: t("settings.backup.colSize"), render: (r) => `${r.sizeKb} KB` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <StatCard icon={DatabaseBackup} label={t("settings.backup.statTotalSize")} value={`${Math.round(totalKb * 10) / 10} KB`} tone="primary" />
        <StatCard icon={DatabaseBackup} label={t("settings.backup.statKeyCount")} value={String(rows.length)} tone="info" />
      </div>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} className="gap-2">
            <DatabaseBackup className="h-4 w-4" />
            {t("settings.backup.exportButton")}
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="gap-2">
            <Upload className="h-4 w-4" />
            {t("settings.backup.importButton")}
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("settings.backup.hint")}</p>

      <DataTable columns={columns} rows={rows} rowKey={(r) => r.key} isLoading={false} emptyIcon={DatabaseBackup} emptyTitle={t("rapports.emptyTitle")} emptyDescription={t("rapports.emptyDescription")} />
    </div>
  )
}
