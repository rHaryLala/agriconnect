/** Prefixed unique id. crypto.randomUUID() avoids the collisions Date.now() produces on a double-click or rapid successive inserts. */
export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
