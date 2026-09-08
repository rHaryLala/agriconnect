import { createBrowserRouter, Navigate, Outlet } from "react-router"
import { AppLayout } from "./layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { RouteError } from "./RouteError"
import { AuthRedirectWatcher } from "@/features/auth/AuthRedirectWatcher"

export const router = createBrowserRouter([
  {
    id: "root",
    element: (
      <>
        <AuthRedirectWatcher />
        <Outlet />
      </>
    ),
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
                element: <ProtectedRoute module="production" />,
                children: [
                  { path: "production", lazy: async () => ({ Component: (await import("@/features/production/ProductionPage")).default }) },
                ],
              },
               {
                element: <ProtectedRoute module="stock" />,
                children: [
                  { path: "stocks", lazy: async () => ({ Component: (await import("@/features/stocks/StocksPage")).default }) },
                ],
              },
              {
                element: <ProtectedRoute module="finance" />,
                children: [
                  { path: "finance", lazy: async () => ({ Component: (await import("@/features/finance/FinancePage")).default }) },
                  { path: "clients", lazy: async () => ({ Component: (await import("@/features/clients/ClientsPage")).default }) },
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