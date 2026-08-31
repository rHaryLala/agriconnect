import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { useFinanceStore } from "./financeStore"
import { FinanceOverviewTab } from "./FinanceOverviewTab"
import { FinanceTransactionsTab } from "./FinanceTransactionsTab"
import { FinanceCashBookTab } from "./FinanceCashBookTab"

export default function FinancePage() {
  const { t } = useTranslation()
  const { transactions, isLoading, fetchAll, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore()
  const [activeTab, setActiveTab] = useState("apercu")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const TABS = [
    { id: "apercu", label: t("finance.tabs.overview") },
    { id: "transactions", label: t("finance.tabs.transactions") },
    { id: "caisse", label: t("finance.tabs.cashbook") },
  ]

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">{t("finance.pageTitle")}</h2>
      <p className="mb-6 text-sm text-muted-foreground">{t("finance.pageSubtitle")}</p>

      <SimpleTabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <div key={activeTab} className="animate-content-in mt-4">
        {activeTab === "apercu" && <FinanceOverviewTab transactions={transactions} />}
        {activeTab === "transactions" && (
          <FinanceTransactionsTab transactions={transactions} isLoading={isLoading} onAdd={addTransaction} onUpdate={updateTransaction} onDelete={deleteTransaction} />
        )}
        {activeTab === "caisse" && <FinanceCashBookTab transactions={transactions} />}
      </div>
    </div>
  )
}