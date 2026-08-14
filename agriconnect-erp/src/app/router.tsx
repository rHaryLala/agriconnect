import { createBrowserRouter, Navigate } from "react-router"
import { AppLayout } from "./layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"

export const router = createBrowserRouter([
  {
    path: "/login",
    lazy: async () => {
      const { default: Component } = await import("@/features/auth/LoginPage")
      return { Component }
    },
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: "dashboard",
            lazy: async () => {
              const { default: Component } = await import("@/features/dashboard/DashboardPage")
              return { Component }
            },
          },
          {
            path: "production",
            lazy: async () => {
              const { default: Component } = await import("@/features/production/ProductionPage")
              return { Component }
            },
          },
          {
            path: "stocks",
            lazy: async () => {
              const { default: Component } = await import("@/features/stocks/StocksPage")
              return { Component }
            },
          },
          {
            path: "finance",
            lazy: async () => {
              const { default: Component } = await import("@/features/finance/FinancePage")
              return { Component }
            },
          },
          {
            path: "clients-fournisseurs",
            lazy: async () => {
              const { default: Component } = await import("@/features/clients-fournisseurs/ClientsFournisseursPage")
              return { Component }
            },
          },
          {
            path: "rapports",
            lazy: async () => {
              const { default: Component } = await import("@/features/rapports/RapportsPage")
              return { Component }
            },
          },
          {
            path: "settings",
            lazy: async () => {
              const { default: Component } = await import("@/features/settings/SettingsPage")
              return { Component }
            },
          },
        ],
      },
    ],
  },
])