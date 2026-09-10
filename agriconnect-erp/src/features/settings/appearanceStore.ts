import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type AccentColor = "green" | "blue" | "purple" | "amber" | "red" | "pink" | "cyan" | "orange"

/** HSL triplets matching the `--primary` / `--ring` custom properties in index.css. */
export const ACCENT_COLORS: Record<AccentColor, { hsl: string; swatch: string }> = {
  green: { hsl: "156 78% 29%", swatch: "#0F8A5F" },
  blue: { hsl: "221 83% 53%", swatch: "#2563EB" },
  purple: { hsl: "263 70% 55%", swatch: "#8B5CF6" },
  amber: { hsl: "38 92% 45%", swatch: "#DB9A08" },
  red: { hsl: "0 74% 47%", swatch: "#D32424" },
  pink: { hsl: "330 76% 52%", swatch: "#DE2683" },
  cyan: { hsl: "189 85% 38%", swatch: "#0E9BB4" },
  orange: { hsl: "24 88% 48%", swatch: "#E56A0E" },
}

interface AppearanceState {
  accent: AccentColor
  compactView: boolean
  animations: boolean
  setAccent: (accent: AccentColor) => void
  setCompactView: (value: boolean) => void
  setAnimations: (value: boolean) => void
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      accent: "green",
      compactView: false,
      animations: true,
      setAccent: (accent) => set({ accent }),
      setCompactView: (compactView) => set({ compactView }),
      setAnimations: (animations) => set({ animations }),
    }),
    {
      name: "agriconnect-appearance",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyAppearance(state.accent, state.compactView, state.animations)
      },
    }
  )
)

export function applyAppearance(accent: AccentColor, compactView: boolean, animations: boolean) {
  const root = document.documentElement
  const hsl = ACCENT_COLORS[accent]?.hsl ?? ACCENT_COLORS.green.hsl
  root.style.setProperty("--primary", hsl)
  root.style.setProperty("--ring", hsl)
  root.style.setProperty("--accent", hsl)
  root.classList.toggle("compact", compactView)
  root.classList.toggle("no-animations", !animations)
}
