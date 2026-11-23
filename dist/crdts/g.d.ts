import { ElementKey, Json } from "./utils";
export interface GSetState {
    /** Canonical serialized elements currently in the set. */
    elements: ElementKey[];
}
export interface GSetDelta {
    /** Canonical serialized elements to union into the receiving replica. */
    elements: ElementKey[];
}
export interface GSetOptions {
    /**
     * Required for non-primitive elements.
     *
     * The serializer must return equivalent JSON for structurally equal
     * elements, or two logically identical objects can become distinct members.
     */
    serialize?: (value: unknown) => Json;
    /** Optional inverse of serialize(); used by values(). */
    deserialize?: (key: ElementKey) => unknown;
}
export declare class GSet<T = unknown> {
    private readonly serialize;
    private readonly deserialize?;
    /** Canonical element keys. A plain object is faster for membership checks. */
    private readonly elements;
    constructor(options?: GSetOptions);
    /**
     * Adds an element.
     *
     * Returns true when the element was newly added; returns false when it was
     * already present. Addition is intentionally idempotent.
     */
    add(value: T): boolean;
    /** Adds many elements and returns the number that were newly added. */
    addAll(values: Iterable<T>): number;
    has(value: T): boolean;
    hasKey(key: ElementKey): boolean;
    size(): number;
    /** Returns stable canonical keys for all elements. */
    keys(): ElementKey[];
    /** Returns deserialized elements. */
    values(): T[];
    /** Returns canonical key/value pairs. */
    entries(): [ElementKey, T][];
    /**
     * Merges another complete G-Set state.
     *
     * Merge is set union, making it commutative, associative, and idempotent.
     */
    merge(state: GSetState): void;
    /**
     * Merges a delta.
     *
     * A delta can contain one element, many elements, or be empty. It can be
     * sent repeatedly without changing the resulting set.
     */
    mergeDelta(delta: GSetDelta | Array<GSetDelta>): void;
    /**
     * Returns elements not present in `since`.
     *
     * Use this for incremental synchronization. The result is a valid G-Set
     * delta: applying it repeatedly has no additional effect.
     */
    getDelta(since?: GSetState): GSetDelta;
    /** Returns the complete state for persistence or initial synchronization. */
    getState(): GSetState;
    /**
     * Creates a new G-Set containing the union of this set and another.
     *
     * Neither input is modified.
     */
    union(other: GSet<T>): GSet<T>;
    /**
     * Returns elements present in this set but not in `other`.
     *
     * This is a read-only set operation; it does not mutate either G-Set.
     */
    difference(other: GSet<T>): ElementKey[];
    /**
     * Returns elements present in both sets.
     *
     * This is a read-only set operation; it does not mutate either G-Set.
     */
    intersection(other: GSet<T>): ElementKey[];
    /** Clears only this local in-memory representation. */
    clear(): void;
}
