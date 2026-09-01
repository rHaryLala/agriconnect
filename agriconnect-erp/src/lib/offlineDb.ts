import Dexie, { type Table } from "dexie"

export interface QueuedAction {
  id?: number
  domain: string
  action: string
  payload: unknown
  createdAt: string
}

class OfflineDatabase extends Dexie {
  queue!: Table<QueuedAction, number>

  constructor() {
    super("agriconnect-offline")
    this.version(1).stores({
      queue: "++id, domain, createdAt",
    })
  }
}

export const offlineDb = new OfflineDatabase()