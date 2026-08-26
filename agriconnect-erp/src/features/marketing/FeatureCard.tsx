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
  const { ref: tiltRef, style: tiltStyle, onMouseMove, onMouseEnter, onMouseLeave } = useTilt3D<HTMLDivElement>(6)

  return (
    <div
      ref={(node) => {
        revealRef.current = node
        tiltRef.current = node
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms", ...tiltStyle }}
      className={`group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/70 p-5 text-left shadow-sm backdrop-blur-xl transition-[opacity,transform,box-shadow,border-color] duration-700 ease-out will-change-transform hover:shadow-xl hover:shadow-[#0F8A5F]/10 hover:border-[#0F8A5F]/30 motion-reduce:transition-none sm:p-6 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F8A5F]/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0F8A5F]/15">
        <Icon className="h-5 w-5 text-[#0F8A5F]" strokeWidth={1.75} />
      </div>

      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{description}</p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#0F8A5F] to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  )
}