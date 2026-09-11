import { randomToken } from "rxdb/plugins/utils"
import { getOfflineDb } from "./offlineDb"
import type { QueuedActionDoc } from "./offlineDb"

export interface QueuedAction {
  id: string
  domain: string
  action: string
  payload: unknown
  createdAt: string
}

type Replayer = (action: QueuedAction) => Promise<void>
const replayers = new Map<string, Replayer>()

export function registerReplayer(domain: string, replayer: Replayer) {
  replayers.set(domain, replayer)
}

// Deux actions enregistrées dans la même milliseconde doivent rester ordonnées :
// la file est rejouée en FIFO et un « update » ne doit jamais précéder son « add ».
let lastTimestamp = 0
function nextCreatedAt(): string {
  const now = Math.max(Date.now(), lastTimestamp + 1)
  lastTimestamp = now
  return new Date(now).toISOString()
}

function toQueuedAction(doc: QueuedActionDoc): QueuedAction {
  return {
    id: doc.id,
    domain: doc.domain,
    action: doc.action,
    payload: JSON.parse(doc.payload),
    createdAt: doc.createdAt,
  }
}

export async function enqueue(domain: string, action: string, payload: unknown) {
  const db = await getOfflineDb()
  await db.queue.insert({
    id: randomToken(16),
    domain,
    action,
    payload: JSON.stringify(payload ?? null),
    createdAt: nextCreatedAt(),
  })
}

export async function getPendingCount(): Promise<number> {
  const db = await getOfflineDb()
  return db.queue.count().exec()
}

export async function drainQueue(): Promise<{ succeeded: number; failed: number }> {
  const db = await getOfflineDb()
  const docs = await db.queue.find({ sort: [{ createdAt: "asc" }] }).exec()
  let succeeded = 0
  let failed = 0

  for (const doc of docs) {
    const replayer = replayers.get(doc.domain)
    if (!replayer) {
      failed++
      continue
    }
    try {
      await replayer(toQueuedAction(doc))
      await doc.remove()
      succeeded++
    } catch {
      failed++
      break
    }
  }

  return { succeeded, failed }
}
