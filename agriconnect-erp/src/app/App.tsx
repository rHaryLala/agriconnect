import { RouterProvider } from "react-router/dom"
import { Toaster } from "@/components/ui/sonner"
import { OfflineStatusWatcher } from "@/components/shared/OfflineStatusWatcher"
import { router } from "./router"
import { OfflineSyncManager } from "@/features/offline/OfflineSyncManager"
import { CookieConsent } from "@/features/consent/CookieConsent"

function App() {
  return (
    <>
      <OfflineStatusWatcher />
      <OfflineSyncManager />
      <RouterProvider router={router} />
      {/* Monte hors du routeur : le bandeau doit s'afficher sur toutes les
          pages, publiques comme protegees, y compris l'ecran de connexion. */}
      <CookieConsent />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App