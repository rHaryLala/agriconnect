import { createBrowserRouter, Navigate, Outlet } from "react-router"
import { AppLayout } from "./layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { RouteError } from "./RouteError"

export const router = createBrowserRouter([
  {
    id: "root",
    element: <Outlet />,
    errorElement: <RouteError />,
    children: [
      {
        // Vitrine publique — page d'accueil, accessible à tout le monde
        path: "/",
        lazy: async () => {
          const { default: Component } = await import("@/features/marketing/LandingPage")
          return { Component }
        },
      },
      {
        path: "/login",
        lazy: async () => {
          const { default: Component } = await import("@/features/auth/LoginPage")
          return { Component }
        },
      },
      {
        path: "/register",
        lazy: async () => {
          const { default: Component } = await import("@/features/auth/RegisterPage")
          return { Component }
        },
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/app",
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/app/dashboard" replace /> },
              {
                path: "dashboard",
                lazy: async () => {
                  const { default: Component } = await import("@/features/dashboard/DashboardPage")
                  return { Component }
                },
              },
              {
                element: <ProtectedRoute allowedRoles={["admin", "ouvrier"]} />,
                children: [
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
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={["admin", "finance_commercial"]} />,
                children: [
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
                ],
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
    ],
  },
])