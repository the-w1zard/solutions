
export type Teardown =
  | void
  | null
  | (() => void)
  | { unsubscribe(): void }
  | { [Symbol.dispose](): void }
  | Teardown[]

export function runTeardown(t: Teardown): void {
  if (t == null) return
  if (typeof t === 'function') return void t()
  if (Array.isArray(t)) { for (const x of t) runTeardown(x); return }
  const a = t as A
  if (typeof a.unsubscribe === 'function') return void a.unsubscribe()
  if (typeof a[Symbol.dispose] === 'function') return void a[Symbol.dispose]()
}

export function reportError(e: unknown): void {
  const g = globalThis as A
  if (typeof g.reportError === 'function') return void g.reportError(e)
  queueMicrotask(() => { throw e })
} 
