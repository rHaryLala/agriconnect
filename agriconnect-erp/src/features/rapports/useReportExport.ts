import { useCallback } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"
import { useAuthStore } from "@/features/auth/authStore"
import { enregistrerBlob, telechargerRapportExcel, telechargerRapportPdf } from "./rapportsApi"

type PdfArgs = Parameters<typeof exportToPdf>
type ExcelArgs = Parameters<typeof exportToExcel>

export function useReportExport() {
  const { t } = useTranslation()

  const run = useCallback(
    async (task: Promise<void>, filename: string) => {
      try {
        await task
        toast.success(t("rapports.toastExported", { filename }))
      } catch (error) {
        console.error(error)
        toast.error(t("rapports.toastExportError"))
      }
    },
    [t],
  )

  const exportPdf = useCallback((...args: PdfArgs) => run(exportToPdf(...args), args[4]), [run])
  const exportExcel = useCallback((...args: ExcelArgs) => run(exportToExcel(...args), args[3]), [run])

  /**
   * Récapitulatif mensuel : le serveur sait le produire à partir de la base,
   * ce qui couvre aussi ce que le front n'a pas en mémoire. S'il est
   * injoignable, on retombe sur l'export composé localement — même fichier
   * attendu, source différente.
   */
  const exportRecapMensuel = useCallback(
    (mois: string, format: "pdf" | "excel", repli: () => Promise<void>, filename: string) =>
      run(
        (async () => {
          const token = useAuthStore.getState().token
          const blob = token
            ? await (format === "pdf" ? telechargerRapportPdf(token, mois) : telechargerRapportExcel(token, mois))
            : null
          if (blob) enregistrerBlob(blob, filename)
          else await repli()
        })(),
        filename,
      ),
    [run],
  )

  return { exportPdf, exportExcel, exportRecapMensuel }
}
