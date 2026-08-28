export const MOCK_DASHBOARD_DATA = {
  production: { harvestThisMonth: 340, activeParcels: 12 },
  stock: { totalItems: 236, lowStockAlerts: 5, warehouses: 3 },
  finance: { revenue: 480_500, expenses: 310_200, margin: 170_300, unpaidInvoices: 6 },
  clients: { totalClients: 5 },
}

export const MOCK_TRENDS = {
  production: [
    { label: "Mars", value: 280 }, { label: "Avr", value: 300 }, { label: "Mai", value: 260 },
    { label: "Juin", value: 320 }, { label: "Juil", value: 310 }, { label: "Août", value: 340 },
  ],
  stock: [
    { label: "Mars", value: 190 }, { label: "Avr", value: 205 }, { label: "Mai", value: 198 },
    { label: "Juin", value: 220 }, { label: "Juil", value: 228 }, { label: "Août", value: 236 },
  ],
}

export const MOCK_STAT_TRENDS = {
  harvest: { value: 8.2, isPositive: true },
  stockItems: { value: 4.7, isPositive: true },
  lowStockAlerts: { value: -1.0, isPositive: true },
  activeParcels: { value: 0, isPositive: true },
} 