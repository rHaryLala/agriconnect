import { addRxPlugin, createRxDatabase } from "rxdb"
import type { RxCollection, RxDatabase, RxJsonSchema } from "rxdb"
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie"

// Document tel qu'il est persisté : le payload est sérialisé en JSON pour
// accepter n'importe quelle forme d'action sans élargir le schéma.
export interface QueuedActionDoc {
  id: string
  domain: string
  action: string
  payload: string
  createdAt: string
}

const queueSchema: RxJsonSchema<QueuedActionDoc> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 64 },
    domain: { type: "string", maxLength: 64 },
    action: { type: "string", maxLength: 64 },
    payload: { type: "string" },
    createdAt: { type: "string", maxLength: 32 },
  },
  required: ["id", "domain", "action", "payload", "createdAt"],
  indexes: ["createdAt", "domain"],
}

interface OfflineCollections {
  queue: RxCollection<QueuedActionDoc>
}

export type OfflineDatabase = RxDatabase<OfflineCollections>

let dbPromise: Promise<OfflineDatabase> | null = null

// En développement, dev-mode exige un validateur de schéma autour du stockage.
// Les deux plugins restent hors du bundle de production.
async function createStorage() {
  const storage = getRxStorageDexie()
  if (!import.meta.env.DEV) return storage

  const [{ RxDBDevModePlugin, disableWarnings }, { wrappedValidateAjvStorage }] = await Promise.all([
    import("rxdb/plugins/dev-mode"),
    import("rxdb/plugins/validate-ajv"),
  ])
  disableWarnings()
  addRxPlugin(RxDBDevModePlugin)

  return wrappedValidateAjvStorage({ storage })
}

async function createDatabase(): Promise<OfflineDatabase> {
  const db = await createRxDatabase<OfflineCollections>({
    name: "agriconnect-offline",
    storage: await createStorage(),
    eventReduce: true,
    // Le rechargement à chaud de Vite réexécute ce module sur une base déjà ouverte.
    ignoreDuplicate: import.meta.env.DEV,
  })

  await db.addCollections({ queue: { schema: queueSchema } })

  return db
}

// Une seule instance par session : RxDB refuse deux bases de même nom.
export function getOfflineDb(): Promise<OfflineDatabase> {
  if (!dbPromise) dbPromise = createDatabase()
  return dbPromise
}
