/**
 * Binary Delta-State CRDT LWW-Register Bank
 * Backed by a contiguous ArrayBuffer slab for zero-allocation performance.
 */
export declare class DELTA_STORE {
    private buffer;
    private view;
    private memoryU8;
    private static readonly SLOT_SIZE;
    private capacity;
    private count;
    private localVersion;
    private peerWatermarks;
    constructor(initialCapacity?: number);
    /**
     * Fast hash utility for string keys into Uint32 space
     */
    private hashKey;
    /**
     * Set or update a key using Last-Write-Wins (LWW) semantics directly in binary memory.
     */
    set(key: string, value: number, timestamp: number, nodeIdHash: number): void;
    private writeSlot;
    private findSlot;
    private resize;
    /**
     * Generates a compact binary delta payload (`Uint8Array`) containing only state mutated
     * since the peer's last known version watermark.
     */
    generateDelta(peerLastVersion: number): Uint8Array;
    /**
     * Merges an incoming binary delta payload from a peer into local memory using deterministic LWW rules.
     */
    mergeDelta(deltaBytes: Uint8Array): void;
    get(key: string): number | undefined;
}
