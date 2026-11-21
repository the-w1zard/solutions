import { VERSION_VECTOR } from './binary_version_vector';
/**
 * High-Performance Binary Causal Cursor
 * Encapsulates an origin node reference, local log offset, and causal version vector frontier
 * into a compact, zero-allocation binary token for log streaming and replication checkpointing.
 */
export declare class CASUAL_CURSOR {
    private buffer;
    private view;
    private memoryU8;
    /**
     * Binary Layout Structure:
     * Header (16 bytes):
     * [0..3]   Magic Header / Version (Uint32: 0x43535201 -> 'CSR1')
     * [4..7]   Origin Node ID Hash (Uint32)
     * [8..15]  Local Sequence / Log Offset (BigUint64)
     *
     * Frontier Section (Immediately following header):
     * [16..19] Frontier Entry Count (Uint32)
     * [20...]  Repeated Frontier Entries (16 bytes per entry: 4-byte Node Hash + 8-byte Sequence + 4-byte padding)
     */
    private static readonly HEADER_SIZE;
    private static readonly ENTRY_SIZE;
    private capacity;
    private frontierCount;
    private originNodeHash;
    private localSequence;
    constructor(originNodeId: string, initialFrontierCapacity?: number);
    private hashString;
    private writeHeader;
    /**
     * Sets the cursor's local log offset and updates the frontier snapshot using a Version Vector.
     */
    advance(newSequence: bigint, frontier: VERSION_VECTOR): void;
    /**
     * Serializes the causal cursor into a compact, immutable binary token (`Uint8Array`)
     * suitable for HTTP headers, WebSocket frames, or database checkpoint storage.
     */
    serialize(): Uint8Array;
    /**
     * Reconstructs a Causal Cursor directly from a binary token without heap allocations.
     */
    static fromBinary(bytes: Uint8Array): CASUAL_CURSOR;
    /**
     * Compares two causal cursors to determine their causal relationship
     * (e.g., whether this cursor strictly dominates, precedes, or is concurrent with another).
     */
    dominates(other: CASUAL_CURSOR): boolean;
    get offset(): bigint;
}
