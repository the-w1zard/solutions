type FlushCallback = () => void;
type BatchScope = symbol;
/** Raw microtask-timing scheduling. No batching, no dedup — just consistent ordering. */
export declare function microtask(fn: FlushCallback): void;
/**
 * Groups writes inside fn into one flush at microtask timing.
 * Nested batch() calls collapse into the outer scope.
 * For an async fn, batching covers only the synchronous prefix before the first
 * await — batchDepth unwinds the instant fn() returns control, which for an async
 * function is exactly the point it suspends. Deliberate: buffering writes across an
 * unbounded await would leave every subscriber (GateMaster, signals, SWR/CQRS-derived
 * state) reading stale values for as long as that await takes.
 */
export declare function batch<T>(fn: () => T): T;
/**
 * Explicit opt-in for the rare case of deliberately spanning an await as one logical
 * batch. Not folded into batch() itself — spanning an await has to be something a dev
 * chooses to do visibly, never something that happens to them by accident.
 */
export declare function openBatch(): BatchScope;
export declare function closeBatch(scope: BatchScope): void;
export declare function isBatching(): boolean;
/**
 * Registers a callback to fire once the current batch settles. Used both by internal
 * state-write primitives (pass a stable per-store notify function so N writes to the
 * same store collapse to one call, same property React/Solid get from batching) and by
 * external one-shot listeners (GateMaster etc.) waiting on the next settle.
 */
export declare function onFlush(cb: FlushCallback): void;
export declare function flush<T>(fn?: () => T): T | void;
export {};
