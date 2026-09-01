import { RouterProvider } from "react-router/dom"
import { Toaster } from "@/components/ui/sonner"
import { OfflineBanner } from "@/components/shared/OfflineBanner"
import { router } from "./router"

function App() {
  return (
    <>
      <OfflineBanner />
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App