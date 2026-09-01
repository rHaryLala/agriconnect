import { offlineDb, type QueuedAction } from "./offlineDb"

type Replayer = (action: QueuedAction) => Promise<void>
const replayers = new Map<string, Replayer>()

export function registerReplayer(domain: string, replayer: Replayer) {
  replayers.set(domain, replayer)
}

export async function enqueue(domain: string, action: string, payload: unknown) {
  await offlineDb.queue.add({ domain, action, payload, createdAt: new Date().toISOString() })
}

export async function getPendingCount(): Promise<number> {
  return offlineDb.queue.count()
}

export async function drainQueue(): Promise<{ succeeded: number; failed: number }> {
  const items = await offlineDb.queue.orderBy("createdAt").toArray()
  let succeeded = 0
  let failed = 0

  for (const item of items) {
    const replayer = replayers.get(item.domain)
    if (!replayer) {
      failed++
      continue
    }
    try {
      await replayer(item)
      await offlineDb.queue.delete(item.id!)
      succeeded++
    } catch {
      failed++
      break
    }
  }

  return { succeeded, failed }
}