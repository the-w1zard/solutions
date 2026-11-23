import { CausalContext, Json, ReplicaId } from "./utils";
export type StoreKey = string;
export interface ValueVersion<T = Json> {
    readonly value: T;
    readonly hlc: string;
    readonly replicaId: ReplicaId;
    readonly deleted: boolean;
}
export interface DeltaStoreState<T = Json> {
    values: Record<StoreKey, ValueVersion<T>>;
    context: CausalContext;
}
export interface DeltaStoreDelta<T = Json> {
    values: Record<StoreKey, ValueVersion<T>>;
    context: CausalContext;
}
export interface DeltaStoreOptions {
    /** Stable, globally unique replica ID. Never reuse after a restore. */
    replicaId: ReplicaId;
    /** Optional deterministic clock source; useful in tests. */
    now?: () => number;
    /**
     * Maximum clock skew accepted before refusing a local write.
     * Defaults to 5 minutes. This prevents a badly skewed clock from
     * monopolizing conflict resolution.
     */
    maxClockSkewMs?: number;
}
export declare class DeltaStoreCRDT<T = Json> {
    private readonly replicaId;
    private readonly now;
    private readonly maxClockSkewMs;
    private physical;
    private logical;
    private values;
    private watermarks;
    constructor(options: DeltaStoreOptions);
    /**
     * Writes a value and returns a delta containing only that write.
     *
     * A later write to the same key supersedes an earlier one once both are
     * observed. A concurrent write resolves by HLC, then replica ID.
     */
    set(key: StoreKey, value: T): DeltaStoreDelta<T>;
    /**
     * Deletes a key and returns a tombstone delta.
     *
     * The tombstone prevents an older write from resurrecting the key after
     * synchronization. A newer write can still intentionally restore it.
     */
    delete(key: StoreKey): DeltaStoreDelta<T>;
    /** Returns the current value, or undefined when absent or deleted. */
    get(key: StoreKey): T | undefined;
    /** Returns true only when the key has a live value. */
    has(key: StoreKey): boolean;
    /** Returns all live keys. */
    keys(): StoreKey[];
    /** Returns all live values. */
    getAll(): T[];
    /** Returns live key/value pairs. */
    entries(): [StoreKey, T][];
    size(): number;
    /**
     * Merges a full remote state.
     *
     * Applying the same state multiple times has no additional effect.
     */
    merge(state: DeltaStoreState<T>): void;
    /** Merges one or more deltas. Safe for duplicate and out-of-order delivery. */
    mergeDelta(delta: DeltaStoreDelta<T> | Array<DeltaStoreDelta<T>>): void;
    /**
     * Returns changes not represented by `since`.
     *
     * Use the returned delta for normal synchronization; it is substantially
     * smaller than the complete store after the initial sync.
     */
    getDelta(since?: DeltaStoreState<T>): DeltaStoreDelta<T>;
    /**
     * Returns the complete state for initial synchronization or persistence.
     */
    getState(): DeltaStoreState<T>;
    /**
     * Removes history that every known replica has causally observed.
     *
     * A version is removable when its HLC is at or below every replica's
     * watermark. This prevents removing an update that a slow replica may still
     * need in order to resolve a future concurrent write correctly.
     */
    prune(): number;
    /**
     * Removes only deleted tombstones that all known replicas have observed.
     *
     * This is the preferred production GC mode: it preserves live values while
     * reclaiming memory used by deletion history.
     */
    pruneTombstones(): number;
    private shouldReplace;
    private nextHlc;
    private observe;
    private mergeWatermarks;
    private createDelta;
}
