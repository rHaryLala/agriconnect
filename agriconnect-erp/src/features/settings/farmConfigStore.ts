import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface FarmConfig {
  nom: string
  superficieHa: number
  localisation: string
  responsable: string
}

interface FarmConfigState extends FarmConfig {
  setFarmConfig: (config: FarmConfig) => void
}

export const useFarmConfigStore = create<FarmConfigState>()(
  persist(
    (set) => ({
      nom: "Ferme UAZ — Université Adventiste Zurcher",
      superficieHa: 142,
      localisation: "Sambaina, Antsirabe — Madagascar",
      responsable: "LESOA Asandratriniaina — Administrateur",
      setFarmConfig: (config) => set(config),
    }),
    { name: "agriconnect-farm-config", storage: createJSONStorage(() => localStorage) }
  )
)
