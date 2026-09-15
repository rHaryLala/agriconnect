import type { LucideIcon } from "lucide-react"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { useTilt3D } from "@/hooks/useTilt3D"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delayMs?: number
}

export function FeatureCard({ icon: Icon, title, description, delayMs = 0 }: FeatureCardProps) {
  const { ref: revealRef, visible } = useScrollReveal<HTMLDivElement>()
  const { ref: tiltRef, handlers } = useTilt3D<HTMLDivElement>(7)

  // L'apparition et l'inclinaison animent toutes deux `transform` : les séparer
  // sur deux nœuds évite qu'elles s'écrasent l'une l'autre.
  return (
    <div
      ref={revealRef}
      data-visible={visible}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className="reveal-3d h-full motion-reduce:transition-none"
    >
      <div
        ref={tiltRef}
        {...handlers}
        className="tilt-3d specular group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 text-left glass-liquid-light transition-[box-shadow,border-color] duration-500 hover:border-[#0F8A5F]/30 hover:shadow-xl hover:shadow-[#0F8A5F]/10 sm:p-6"
      >
        <div className="relative z-10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F8A5F]/10 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
            <Icon className="h-5 w-5 text-[#0F8A5F]" strokeWidth={1.75} />
          </div>

          <p className="font-semibold text-neutral-900">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{description}</p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#0F8A5F] to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      </div>
    </div>
  )
}
