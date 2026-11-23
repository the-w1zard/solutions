import { ReplicaId } from "./utils";
export type VersionVectorState = Record<ReplicaId, number>;
export type VersionVectorDelta = Partial<VersionVectorState>;
export type CausalRelationVector = 'equal' | 'before' | 'after' | 'concurrent';
export interface VersionVectorOptions {
    /**
     * Stable, globally unique replica ID.
     * Must never be reused after restoring from a backup.
     */
    replicaId: ReplicaId;
}
/** Returns a defensive copy of a version-vector state. */
export declare function cloneVersionVector(state?: VersionVectorState): VersionVectorState;
/**
 * Merges two version vectors using the pointwise maximum.
 *
 * This function does not mutate either input.
 */
export declare function mergeVersionVectors(a?: VersionVectorState, b?: VersionVectorState): VersionVectorState;
/**
 * Compares two version vectors.
 *
 * - `equal`: identical causal histories
 * - `before`: `a` is an ancestor of `b`
 * - `after`: `a` dominates `b`
 * - `concurrent`: neither vector dominates the other
 */
export declare function compareVersionVectors(a?: VersionVectorState, b?: VersionVectorState): CausalRelationVector;
/** Returns true when `a` contains every update represented by `b`. */
export declare function dominates(a: VersionVectorState, b: VersionVectorState): boolean;
/** Returns only entries in `current` that are newer than `since`. */
export declare function diffVersionVectors(current?: VersionVectorState, since?: VersionVectorState): VersionVectorDelta;
export declare class VersionVectorCRDT {
    private readonly replicaId;
    private counters;
    constructor(options: VersionVectorOptions);
    /**
     * Records a local event and returns the resulting full version vector.
     *
     * Only this replica's component is incremented; all other components retain
     * the highest versions already observed.
     */
    increment(): VersionVectorState;
    /** Returns the current counter for a replica; absent replicas are zero. */
    get(replicaId: ReplicaId): number;
    /** Returns true when this vector has observed at least one event from `replicaId`. */
    has(replicaId: ReplicaId): boolean;
    /** Returns every replica currently represented in the vector. */
    replicas(): ReplicaId[];
    /** Returns the number of replicas represented, including this replica after its first event. */
    size(): number;
    /**
     * Merges a remote version vector.
     *
     * Applying the same vector twice has no additional effect.
     */
    merge(state: VersionVectorState): void;
    /** Merges a compact delta. Safe for duplicate and out-of-order delivery. */
    mergeDelta(delta: VersionVectorDelta | Array<VersionVectorDelta>): void;
    /**
     * Returns only components newer than `since`.
     *
     * Use this for efficient synchronization after the initial exchange.
     */
    getDelta(since?: VersionVectorState): VersionVectorDelta;
    /** Returns a defensive copy of the complete version vector. */
    getState(): VersionVectorState;
    /** Compares this vector with another vector without modifying either. */
    compare(other: VersionVectorState): CausalRelationVector;
    /** Returns true when this vector contains every update in `other`. */
    dominates(other: VersionVectorState): boolean;
    /**
     * Returns true when this vector has observed the event represented by
     * `(replicaId, counter)`.
     */
    observed(replicaId: ReplicaId, counter: number): boolean;
    /**
     * Removes replica entries whose counters are zero.
     *
     * This is safe only if zero means “no observed event”; it never removes a
     * nonzero causal-history entry.
     */
    compact(): number;
}
