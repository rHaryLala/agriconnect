import type { LucideIcon } from "lucide-react"
import { useScrollReveal } from "@/hooks/useScrollReveal"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delayMs?: number
}

export function FeatureCard({ icon: Icon, title, description, delayMs = 0 }: FeatureCardProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={`rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 text-left shadow-sm transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-lg hover:border-[#0F8A5F]/20 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F8A5F]/10 transition-all duration-300 group-hover:bg-[#0F8A5F]/20">
        <Icon className="h-5 w-5 text-[#0F8A5F] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} />
      </div>
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1.5 text-sm text-neutral-600">{description}</p>
    </div>
  )
}