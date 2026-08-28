import { useEffect, useState } from "react"
import { SimpleTabs } from "@/components/shared/SimpleTabs"
import { useFinanceStore } from "./financeStore"
import { FinanceOverviewTab } from "./FinanceOverviewTab"
import { FinanceTransactionsTab } from "./FinanceTransactionsTab"
import { FinanceCashBookTab } from "./FinanceCashBookTab"

const TABS = [
  { id: "apercu", label: "Vue d'ensemble" },
  { id: "transactions", label: "Transactions" },
  { id: "caisse", label: "Livre de caisse" },
]

export default function FinancePage() {
  const { transactions, isLoading, fetchAll, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore()
  const [activeTab, setActiveTab] = useState("apercu")

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Finance</h2>
      <p className="mb-6 text-sm text-muted-foreground">Dépenses, recettes et marge</p>

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