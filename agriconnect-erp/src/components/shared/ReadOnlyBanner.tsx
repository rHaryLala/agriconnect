import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'

export function ReadOnlyBanner() {
    const { t } = useTranslation()
    return (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-xs text-info">
            <Eye className="h-3.5 w3.5 shrink-0" />
            {t("common.readOnlyBanner")}
        </div>
    ) 
}