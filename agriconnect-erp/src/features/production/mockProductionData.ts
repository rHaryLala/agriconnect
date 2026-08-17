import type { PouleEntry, VacheEntry, KuroilerEntry, CultureEntry } from "@/types/production"

export const SEED_POULES: PouleEntry[] = [
  { id: "p-1", date: "2026-08-15", nbPoules: 320, oeufsJour: 280, alimentsKg: 42, mortalite: 1 },
  { id: "p-2", date: "2026-08-16", nbPoules: 319, oeufsJour: 275, alimentsKg: 41, mortalite: 0 },
]

export const SEED_VACHES: VacheEntry[] = [
  { id: "v-1", date: "2026-08-15", nbVaches: 18, litresJour: 210, suiviSanitaire: "RAS", alimentationKg: 90 },
  { id: "v-2", date: "2026-08-16", nbVaches: 18, litresJour: 205, suiviSanitaire: "1 vache sous surveillance (boiterie légère)", alimentationKg: 90 },
]

export const SEED_KUROILER: KuroilerEntry[] = [
  { id: "k-1", date: "2026-08-15", kgViande: 12, poussinsVendus: 30, oeufsProduits: 45, etapeCycle: "croissance" },
]

export const SEED_CULTURES: CultureEntry[] = [
  { id: "c-1", date: "2026-06-01", culture: "Maïs", surfaceHa: 4, semisQty: 80, recolteQty: 0, intrants: "Engrais NPK 50kg" },
  { id: "c-2", date: "2026-03-01", culture: "Riz", surfaceHa: 2.5, semisQty: 50, recolteQty: 6250, intrants: "Semences certifiées" },
]