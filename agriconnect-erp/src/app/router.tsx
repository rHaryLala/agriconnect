import { createBrowserRouter, Navigate, Outlet } from "react-router"
import { AppLayout } from "./layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { RouteError } from "./RouteError"
import { AuthRedirectWatcher } from "@/features/auth/AuthRedirectWatcher"
import { moduleForRoute } from "./layout/navItems"

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
                path: "recherche",
                lazy: async () => {
                  const { default: Component } = await import("@/features/search/SearchPage")
                  return { Component }
                },
              },
              {
                element: <ProtectedRoute module={moduleForRoute("production")} />,
                children: [
                  { path: "production", lazy: async () => ({ Component: (await import("@/features/production/ProductionPage")).default }) },
                ],
              },
               {
                element: <ProtectedRoute module={moduleForRoute("stocks")} />,
                children: [
                  { path: "stocks", lazy: async () => ({ Component: (await import("@/features/stocks/StocksPage")).default }) },
                ],
              },
              {
                element: <ProtectedRoute module={moduleForRoute("finance")} />,
                children: [
                  { path: "finance", lazy: async () => ({ Component: (await import("@/features/finance/FinancePage")).default }) },
                ],
              },
              {
                element: <ProtectedRoute module={moduleForRoute("clients")} />,
                children: [
                  { path: "clients", lazy: async () => ({ Component: (await import("@/features/clients/ClientsPage")).default }) },
                ],
              },
              {
                element: <ProtectedRoute module={moduleForRoute("fournisseurs")} />,
                children: [
                  { path: "fournisseurs", lazy: async () => ({ Component: (await import("@/features/fournisseurs/FournisseursPage")).default }) },
                  { path: "fournisseurs/:fournisseurId", lazy: async () => ({ Component: (await import("@/features/fournisseurs/FournisseurDetailPage")).default }) },
                ],
              },
              {
                element: <ProtectedRoute module={moduleForRoute("personnel")} />,
                children: [
                  { path: "personnel", lazy: async () => ({ Component: (await import("@/features/personnel/PersonnelPage")).default }) },
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
