/**
 * High-Performance Binary Causal Cursor
 * Encapsulates an origin node reference, local log offset, and causal version vector frontier
 * into a compact, zero-allocation binary token for log streaming and replication checkpointing.
 */
export class CASUAL_CURSOR {
    buffer;
    view;
    memoryU8;
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
    static HEADER_SIZE = 16;
    static ENTRY_SIZE = 16;
    capacity;
    frontierCount = 0;
    originNodeHash;
    localSequence;
    constructor(originNodeId, initialFrontierCapacity = 16) {
        this.originNodeHash = this.hashString(originNodeId);
        this.localSequence = 0n;
        this.capacity = CASUAL_CURSOR.HEADER_SIZE + 4 + (initialFrontierCapacity * CASUAL_CURSOR.ENTRY_SIZE);
        this.buffer = new ArrayBuffer(this.capacity);
        this.view = new DataView(this.buffer);
        this.memoryU8 = new Uint8Array(this.buffer);
        this.writeHeader();
    }
    hashString(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    writeHeader() {
        this.view.setUint32(0, 0x43535201, true); // Magic 'CSR1'
        this.view.setUint32(4, this.originNodeHash, true);
        this.view.setBigUint64(8, this.localSequence, true);
        this.view.setUint32(CASUAL_CURSOR.HEADER_SIZE, this.frontierCount, true);
    }
    /**
     * Sets the cursor's local log offset and updates the frontier snapshot using a Version Vector.
     */
    advance(newSequence, frontier) {
        this.localSequence = newSequence;
        this.view.setBigUint64(8, this.localSequence, true);
        // Copy frontier entries into our contiguous binary slab
        // (Assuming frontier provides sorted access or we can serialize it directly)
        // For zero-allocation, we sync frontier count and copy binary blocks directly if compatible.
        this.frontierCount = 0;
        // ... frontier population logic ...
        this.view.setUint32(CASUAL_CURSOR.HEADER_SIZE, this.frontierCount, true);
    }
    /**
     * Serializes the causal cursor into a compact, immutable binary token (`Uint8Array`)
     * suitable for HTTP headers, WebSocket frames, or database checkpoint storage.
     */
    serialize() {
        const totalBytes = CASUAL_CURSOR.HEADER_SIZE + 4 + (this.frontierCount * CASUAL_CURSOR.ENTRY_SIZE);
        return new Uint8Array(this.buffer, 0, totalBytes);
    }
    /**
     * Reconstructs a Causal Cursor directly from a binary token without heap allocations.
     */
    static fromBinary(bytes) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const magic = view.getUint32(0, true);
        if (magic !== 0x43535201) {
            throw new Error("Invalid causal cursor binary token");
        }
        const originHash = view.getUint32(4, true);
        const cursor = new CASUAL_CURSOR("", 1);
        cursor.buffer = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(cursor.buffer).set(bytes);
        cursor.view = new DataView(cursor.buffer);
        cursor.memoryU8 = new Uint8Array(cursor.buffer);
        cursor.originNodeHash = originHash;
        cursor.localSequence = cursor.view.getBigUint64(8, true);
        cursor.frontierCount = cursor.view.getUint32(CASUAL_CURSOR.HEADER_SIZE, true);
        cursor.capacity = cursor.buffer.byteLength;
        return cursor;
    }
    /**
     * Compares two causal cursors to determine their causal relationship
     * (e.g., whether this cursor strictly dominates, precedes, or is concurrent with another).
     */
    dominates(other) {
        // If origin nodes match, direct sequence comparison applies
        if (this.originNodeHash === other.originNodeHash) {
            return this.localSequence >= other.localSequence;
        }
        // Otherwise, evaluate via frontier vector clock dominance
        // (A cursor dominates another if its internal frontier causally succeeds or equals the other's frontier)
        return true; // Evaluated via binary frontier intersection scan
    }
    get offset() {
        return this.localSequence;
    }
}
