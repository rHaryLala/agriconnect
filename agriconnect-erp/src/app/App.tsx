import { RouterProvider } from "react-router/dom"
import { Toaster } from "@/components/ui/sonner"
import { OfflineStatusWatcher } from "@/components/shared/OfflineStatusWatcher"
import { router } from "./router"

function App() {
  return (
    <>
      <OfflineStatusWatcher  />
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App