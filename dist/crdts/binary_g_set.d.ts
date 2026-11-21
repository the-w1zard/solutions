/**
 * High-Performance Binary Grow-Only Set (G-Set) CRDT
 * Backed by a contiguous ArrayBuffer slab with sorted hashes for zero-allocation performance.
 */
export declare class G_SET {
    private buffer;
    private view;
    private memoryU8;
    /**
     * Slot layout per Element Record (16 bytes):
     * [0..3]   Element Hash (Uint32) - Maintained in strictly sorted ascending order
     * [4..11]  Metadata / Insertion Epoch or Payload (Float64)
     * [12..15] Reserved / Alignment Padding (4 bytes)
     */
    private static readonly SLOT_SIZE;
    private capacity;
    private count;
    constructor(initialCapacity?: number);
    private hashString;
    /**
     * Adds an element to the set. If the element already exists, it is a no-op.
     * Maintains sorted order using binary search and shifting for $O(\log n)$ lookup and $O(n)$ insertion.
     */
    add(element: string, metadata?: number): boolean;
    /**
     * Evaluates whether an element is present in the G-Set using $O(\log n)$ binary search.
     */
    has(element: string): boolean;
    private findIndexOrInsertionPoint;
    private writeSlot;
    private resize;
    /**
     * Generates a compact binary delta payload (`Uint8Array`) containing the active slab data.
     */
    generateDelta(): Uint8Array;
    /**
     * Merges a remote binary delta payload into the local set via high-speed set union.
     */
    mergeDelta(deltaBytes: Uint8Array): void;
    get size(): number;
}
