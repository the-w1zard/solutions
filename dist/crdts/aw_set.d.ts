import { Json } from "./utils";
export type ElementKey = string;
export interface Tag {
    /** Stable replica identifier; must be unique across the deployment. */
    readonly replica: string;
    /** Monotonic per-replica counter. */
    readonly counter: number;
}
export interface AWSetState<T = any> {
    /** Stable serialized element -> live add tags. */
    adds: Record<ElementKey, Tag[]>;
    /** Stable serialized element -> tombstoned add tags. */
    removes: Record<ElementKey, Tag[]>;
}
export interface AWSetDelta<T> {
    adds: Record<ElementKey, Tag[]>;
    removes: Record<ElementKey, Tag[]>;
}
export interface AWSetOptions<T = any> {
    /**
     * Stable ID for this replica, such as a UUID, database row ID, or
     * server-assigned device ID. It must never be reused after a reset.
     */
    replicaId: string;
    /**
     * Optional deterministic serializer. Required for non-primitive elements.
     * It must produce the same key for structurally equal elements.
     */
    serialize?: (value: T) => Json;
    /**
     * Optional deserializer for values returned by values()/entries().
     */
    deserialize?: (key: ElementKey) => T;
}
export declare class AWSet<T> {
    private readonly replicaId;
    private readonly serialize;
    private readonly deserialize?;
    private counter;
    private readonly adds;
    private readonly removes;
    constructor(options: AWSetOptions);
    /** Adds an element and returns its newly created add tag. */
    add(value: T): Tag;
    /**
     * Removes every locally observed add tag for the element.
     *
     * Returns the number of tags tombstoned. A return value of 0 means this
     * replica had not observed any live add for the element.
     */
    remove(value: T): number;
    has(value: T): boolean;
    size(): number;
    /** Returns the current effective elements. */
    values(): T[];
    /** Returns stable serialized keys for all live elements. */
    keys(): ElementKey[];
    entries(): [ElementKey, T][];
    /** Merges another full state into this replica. Idempotent and commutative. */
    merge(state: AWSetState<T>): void;
    /** Merges a delta produced by add() or remove(). */
    mergeDelta(delta: AWSetDelta<T>): void;
    /**
     * Removes tags that are both added and tombstoned.
     *
     * This is safe because a tombstone permanently cancels its matching add tag.
     * Call it periodically after merge; it reduces memory but does not change
     * the observable set.
     */
    prune(): void;
    /** Returns a deep copy of the complete CRDT state. */
    getState(): AWSetState<T>;
    /**
     * Returns only the changes made locally since the supplied state.
     *
     * This is useful for efficient sync: send the delta rather than the full set.
     * The returned delta is safe to apply repeatedly.
     */
    getDelta(since?: AWSetState<T>): AWSetDelta<T>;
    private cloneRecord;
}
