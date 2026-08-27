import { Leaf } from "lucide-react"

export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-primary/15">
        <Leaf className="h-6 w-6 text-primary" strokeWidth={2} />
      </div>
      <div className="h-2 w-24 animate-pulse rounded-full bg-muted" />
    </div>
  )
}