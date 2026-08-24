import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()

  let message = "Une erreur inattendue est survenue."
  if (isRouteErrorResponse(error)) {
    message = `${error.status} — ${error.statusText}`
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Oups, quelque chose s'est mal passé</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recharger la page
        </Button>
        <Button onClick={() => navigate("/dashboard")}>Retour au tableau de bord</Button>
      </div>
    </div>
  )
}