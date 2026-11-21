// microtask.ts
// Built entirely on queueMicrotask/Promise microtask timing — deliberately never touches
// process.nextTick. That queue's drain order relative to Promise microtasks differs between
// Node and Bun (Bun has been observed draining Promise callbacks before nextTick, the reverse
// of Node's documented order). queueMicrotask ordering relative to Promise resolution is
// spec'd by ECMA-262/HTML, not engine-specific, so staying on it entirely sidesteps that
// divergence rather than trying to compensate for it.

type FlushCallback = () => void;
type BatchScope = symbol;

let batchDepth = 0;
const openScopes = new Set<BatchScope>();
let dirty = new Set<FlushCallback>();
let flushScheduled = false;

function scheduleDrain(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(drain);
}

function drain(): void {
  flushScheduled = false;
  if (dirty.size === 0) return;

  // An explicit openBatch() scope is still open (deliberately spanning an await) —
  // don't drop the pending callbacks, just wait for closeBatch() to let them through.
  if (openScopes.size > 0) {
    scheduleDrain();
    return;
  }

  const callbacks = dirty;
  dirty = new Set();
  for (const cb of callbacks) cb();
}

/** Raw microtask-timing scheduling. No batching, no dedup — just consistent ordering. */
export function microtask(fn: FlushCallback): void {
  queueMicrotask(fn);
}

/**
 * Groups writes inside fn into one flush at microtask timing.
 * Nested batch() calls collapse into the outer scope.
 * For an async fn, batching covers only the synchronous prefix before the first
 * await — batchDepth unwinds the instant fn() returns control, which for an async
 * function is exactly the point it suspends. Deliberate: buffering writes across an
 * unbounded await would leave every subscriber (GateMaster, signals, SWR/CQRS-derived
 * state) reading stale values for as long as that await takes.
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
  }
}

/**
 * Explicit opt-in for the rare case of deliberately spanning an await as one logical
 * batch. Not folded into batch() itself — spanning an await has to be something a dev
 * chooses to do visibly, never something that happens to them by accident.
 */
export function openBatch(): BatchScope {
  const scope: BatchScope = Symbol('batch-scope');
  openScopes.add(scope);
  return scope;
}

export function closeBatch(scope: BatchScope): void {
  openScopes.delete(scope);
  if (openScopes.size === 0 && dirty.size > 0) {
    scheduleDrain();
  }
}

export function isBatching(): boolean {
  return batchDepth > 0 || openScopes.size > 0;
}

/**
 * Registers a callback to fire once the current batch settles. Used both by internal
 * state-write primitives (pass a stable per-store notify function so N writes to the
 * same store collapse to one call, same property React/Solid get from batching) and by
 * external one-shot listeners (GateMaster etc.) waiting on the next settle.
 */
export function onFlush(cb: FlushCallback): void {
  dirty.add(cb);
  scheduleDrain();
}

/** Synchronous escape hatch — drains right now. Refuses to run inside an open explicit
 * scope so it can't silently truncate a deliberately-spanned async batch out from under
 * the caller; a plain nested batch() is not protected, since calling flush() explicitly
 * from inside one is the caller saying they know what they're doing. */
function flushSync(): void {
  if (openScopes.size > 0) return;
  flushScheduled = false;
  if (dirty.size === 0) return;
  const callbacks = dirty;
  dirty = new Set();
  for (const cb of callbacks) cb();
}

export function flush<T>(fn?: () => T): T | void {
  if (!fn) {
    flushSync();
    return;
  }
  batchDepth++;
  let result: T;
  try {
    result = fn();
  } finally {
    batchDepth--;
  }
  flushSync();
  return result;
}
