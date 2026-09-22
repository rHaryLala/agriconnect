import { useCallback } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { exportToPdf, exportToExcel } from "@/lib/reportExport"

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

  return { exportPdf, exportExcel }
}
