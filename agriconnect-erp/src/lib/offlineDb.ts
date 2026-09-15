import { addRxPlugin, createRxDatabase } from "rxdb"
import type { RxCollection, RxDatabase, RxJsonSchema } from "rxdb"
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie"

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
    ignoreDuplicate: import.meta.env.DEV,
  })

  await db.addCollections({ queue: { schema: queueSchema } })

  return db
}

export function getOfflineDb(): Promise<OfflineDatabase> {
  if (!dbPromise) dbPromise = createDatabase()
  return dbPromise
}
