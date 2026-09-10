import type { PouleEntry, VacheEntry, KuroilerEntry, CultureEntry, BovinAnimal, PoulardMouvement } from "@/types/production"

export const SEED_POULES: PouleEntry[] = [
  {
    id: "p-1",
    date: "2026-08-15",
    cages: [
      { cageId: "cage-1", nbPoules: 5 },
      { cageId: "cage-2", nbPoules: 4 },
      { cageId: "cage-3", nbPoules: 5 },
      { cageId: "cage-4", nbPoules: 5 },
    ],
    production: { gmNormal: 11, gmCasse: 1, pmNormal: 3, pmCasse: 1 },
    alimentsKg: 42,
    mortalite: 0,
    observation: "RAS",
  },
]

export const SEED_VACHES: VacheEntry[] = [
  {
    id: "v-1",
    date: "2026-08-15",
    traites: [
      { vacheId: "vache-1", matin: 12, soir: 10 },
      { vacheId: "vache-2", matin: 14, soir: 11 },
      { vacheId: "vache-3", matin: 9, soir: 8 },
      { vacheId: "vache-4", matin: 11, soir: 9 },
      { vacheId: "vache-5", matin: 13, soir: 10 },
    ],
    alimentationKg: 90,
    suiviSanitaire: "RAS",
  },
]

export const SEED_KUROILER: KuroilerEntry[] = [
  { id: "k-1", date: "2026-08-15", kgViande: 12, poussinsVendus: 30, oeufsProduits: 45, etapeCycle: "Croissance", observation: "RAS" },
]

export const SEED_CULTURES: CultureEntry[] = [
  { id: "c-1", date: "2026-06-01", culture: "Maïs", surfaceHa: 4, recolteQty: 0, coutIntrants: 180_000, intrants: "Engrais NPK 50kg" },
  { id: "c-2", date: "2026-03-01", culture: "Riz", surfaceHa: 2.5, recolteQty: 6250, coutIntrants: 220_000, intrants: "Semences certifiées" },
]

export const SEED_BOVINS: BovinAnimal[] = [
  { id: "b-1", identifiant: "Vero", genre: "femelle", dateEntree: "2024-02-10", typeEntree: "achat", statut: "present", observation: "RAS" },
  { id: "b-2", identifiant: "Bruno", genre: "male", dateEntree: "2024-05-03", typeEntree: "naissance", statut: "present", observation: "RAS" },
  {
    id: "b-3",
    identifiant: "Tsara",
    genre: "femelle",
    dateEntree: "2023-11-20",
    typeEntree: "achat",
    statut: "vendu",
    dateSortie: "2026-07-12",
    typeSortie: "vente",
    clientId: "cl-4",
    prixVente: 1_800_000,
    signataire: "Rakoto",
    observation: "RAS",
  },
]

export const SEED_POULARD: PoulardMouvement[] = [
  { id: "pl-1", date: "2026-07-05", type: "entree", quantite: 200, observation: "Mise en élevage — bande D" },
  { id: "pl-2", date: "2026-08-02", type: "mortalite", quantite: 6, observation: "RAS" },
  { id: "pl-3", date: "2026-08-20", type: "vente", quantite: 50, clientId: "cl-1", prixUnitaire: 12_000, observation: "RAS" },
]