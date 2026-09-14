import type { PouleEntry, VacheEntry, KuroilerEntry, KuroilerPoule, KuroilerPouleSuivi, CultureEntry, BovinAnimal, PoulardMouvement, RizRecolte, RizSechageEvent, RizDecorticage, RizVente, HaricotMouvement } from "@/types/production"

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
]

export const SEED_BOVINS: BovinAnimal[] = [
  { id: "b-1", identifiant: "Vero", genre: "femelle", race: "Pie rouge", type: "Vache", productivite: "productive", etat: "mampinono", dateEntree: "2024-02-10", typeEntree: "achat", statut: "present", observation: "RAS" },
  { id: "b-2", identifiant: "Bruno", genre: "male", race: "Zébu", type: "Taureau", dateEntree: "2024-05-03", typeEntree: "naissance", statut: "present", observation: "RAS" },
  { id: "b-4", identifiant: "Soa", genre: "femelle", race: "Rana", type: "Génisse", productivite: "taris", etat: "gestante", dateEntree: "2025-03-18", typeEntree: "naissance", statut: "present", observation: "RAS" },
  {
    id: "b-3",
    identifiant: "Tsara",
    genre: "femelle",
    race: "Holstein",
    type: "Vache",
    productivite: "taris",
    etat: "non_gestant",
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

export const SEED_RIZ_RECOLTES: RizRecolte[] = [
  { id: "rr-1", date: "2026-06-10", sacs: 120, quantiteKg: 6_000, transport: "Camion UAZ-01", conducteur: "Njaka", magasinier: "Rakoto", observation: "Parcelle P02" },
]

export const SEED_RIZ_SECHAGE: RizSechageEvent[] = [
  { id: "rs-1", date: "2026-06-15", type: "passage", quantiteSortie: 3_000, quantiteRetournee: 2_700, observation: "1ère vague" },
  { id: "rs-2", date: "2026-06-22", type: "finalisation", sacs: 100, quantiteKg: 4_800, observation: "Séchage terminé" },
]

export const SEED_RIZ_DECORTICAGE: RizDecorticage[] = [
  { id: "rd-1", date: "2026-07-01", quantitePaddyKg: 2_000, quantiteRizKg: 1_300, observation: "RAS" },
]

export const SEED_RIZ_VENTES: RizVente[] = [
  { id: "rv-1", date: "2026-08-05", quantiteKg: 300, clientId: "cl-2", prixUnitaire: 3_200, paymentMethod: "commande", observation: "RAS" },
]

export const SEED_HARICOTS: HaricotMouvement[] = [
  { id: "hs-1", date: "2026-06-20", variante: "blanc", type: "entree", quantiteKg: 400, observation: "Récolte parcelle P05" },
  { id: "hs-2", date: "2026-06-20", variante: "rouge", type: "entree", quantiteKg: 250, observation: "Récolte parcelle P06" },
  { id: "hs-3", date: "2026-08-10", variante: "blanc", type: "vente", quantiteKg: 60, clientId: "cl-1", prixUnitaire: 4_500, paymentMethod: "comptant", observation: "RAS" },
]

export const SEED_KUROILER_POULES: KuroilerPoule[] = [
  { id: "kp-1", bracelet: "KR-001", dateEntree: "2026-02-10", ageMois: 7, ponte: true, statut: "active", observation: "RAS" },
  { id: "kp-2", bracelet: "KR-002", dateEntree: "2026-02-10", ageMois: 7, ponte: true, statut: "active", observation: "RAS" },
  { id: "kp-3", bracelet: "KR-003", dateEntree: "2026-02-10", ageMois: 7, ponte: false, statut: "active", observation: "Reprise de poids en cours" },
  { id: "kp-4", bracelet: "KR-004", dateEntree: "2026-03-05", ageMois: 6, ponte: false, statut: "morte", dateSortie: "2026-08-02", observation: "Mortalité — cause non identifiée" },
  { id: "kp-5", bracelet: "KR-005", dateEntree: "2026-03-05", ageMois: 6, ponte: false, statut: "vendue", dateSortie: "2026-08-18", observation: "Vente sur place" },
]

export const SEED_KUROILER_SUIVIS: KuroilerPouleSuivi[] = [
  { id: "ks-1", pouleId: "kp-1", date: "2026-09-07", poidsKg: 2.4, vaccin: "Newcastle", observation: "RAS" },
  { id: "ks-2", pouleId: "kp-1", date: "2026-08-31", poidsKg: 2.3, vaccin: "", observation: "RAS" },
  { id: "ks-3", pouleId: "kp-2", date: "2026-09-07", poidsKg: 2.6, vaccin: "Newcastle", observation: "RAS" },
  { id: "ks-4", pouleId: "kp-3", date: "2026-09-07", poidsKg: 1.9, vaccin: "Newcastle", observation: "Poids sous la moyenne" },
]
