import type { ReactNode } from "react"
import { useScrollReveal } from "@/hooks/useScrollReveal"

interface RevealProps {
  children: ReactNode
  delayMs?: number
  className?: string
}

/**
 * Apparition à l'entrée dans le viewport. L'observateur se déconnecte après le
 * premier passage : le contenu ne rejoue pas l'animation au défilement inverse.
 */
export function Reveal({ children, delayMs = 0, className = "" }: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  )
}
