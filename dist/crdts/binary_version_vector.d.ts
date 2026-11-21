export declare enum CausalRelation {
    EQUAL = 0,
    BEFORE = -1,
    AFTER = 1,
    CONCURRENT = 2
}
/**
 * High-Performance Binary Version Vector
 * Backed by a contiguous ArrayBuffer slab with sorted Node ID hashes for zero-allocation causal checks.
 */
export declare class VERSION_VECTOR {
    private buffer;
    private view;
    private memoryU8;
    /**
     * Slot layout per Node Entry (16 bytes):
     * [0..3]   Node ID Hash (Uint32) - Maintained in strictly sorted ascending order
     * [4..11]  Sequence / Counter (BigUint64)
     * [12..15] Reserved / Padding (4 bytes)
     */
    private static readonly SLOT_SIZE;
    private capacity;
    private count;
    private localNodeIdHash;
    constructor(localNodeId: string, initialCapacity?: number);
    private hashString;
    /**
     * Increments the sequence number for the local node.
     */
    incrementLocal(): bigint;
    increment(nodeIdHash: number): bigint;
    /**
     * Gets the sequence number for a given node ID hash.
     */
    get(nodeIdHash: number): bigint;
    /**
     * Sets or updates a node's sequence number.
     */
    set(nodeIdHash: number, seq: bigint): void;
    /**
     * Merges a remote version vector into this vector via point-wise maximum (`Math.max` per node ID).
     */
    merge(remote: VERSION_VECTOR): void;
    /**
     * Compares two version vectors causally with zero allocations.
     * - BEFORE: self <= other (and strictly smaller in at least one component)
     * - AFTER: self >= other (and strictly larger in at least one component)
     * - EQUAL: all components identical
     * - CONCURRENT: neither dominates the other
     */
    compare(other: VERSION_VECTOR): CausalRelation;
    private findIndexOrInsertionPoint;
    private resize;
}
