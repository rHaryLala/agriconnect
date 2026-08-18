import type { ComponentProps } from "react"
import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "@/hooks/useTheme"

export function Toaster(props: ComponentProps<typeof SonnerToaster>) {
  const { theme } = useTheme()
  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--surface))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}