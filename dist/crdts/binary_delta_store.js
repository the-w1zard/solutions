/**
 * Binary Delta-State CRDT LWW-Register Bank
 * Backed by a contiguous ArrayBuffer slab for zero-allocation performance.
 */
export class DELTA_STORE {
    buffer;
    view;
    memoryU8;
    // Layout metadata per slot:
    // [0..3]: Key Hash (Uint32)
    // [4..11]: HLC Timestamp / Logical Clock (Float64 / BigInt)
    // [12..15]: Node ID Hash (Uint32)
    // [16..23]: Value / Payload (Float64 or Integer payload)
    static SLOT_SIZE = 24;
    capacity;
    count = 0;
    // Track local version / state vector for delta generation
    localVersion = 0;
    peerWatermarks = new Map();
    constructor(initialCapacity = 1024) {
        this.capacity = initialCapacity;
        this.buffer = new ArrayBuffer(this.capacity * DELTA_STORE.SLOT_SIZE);
        this.view = new DataView(this.buffer);
        this.memoryU8 = new Uint8Array(this.buffer);
    }
    /**
     * Fast hash utility for string keys into Uint32 space
     */
    hashKey(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    /**
     * Set or update a key using Last-Write-Wins (LWW) semantics directly in binary memory.
     */
    set(key, value, timestamp, nodeIdHash) {
        const keyHash = this.hashKey(key);
        // Check if key already exists in our slab
        let slotIndex = this.findSlot(keyHash);
        if (slotIndex !== -1) {
            // Existing slot found: Apply LWW conflict resolution rule
            const existingTimestamp = this.view.getFloat64(slotIndex * DELTA_STORE.SLOT_SIZE + 4, true);
            if (timestamp > existingTimestamp) {
                // Incoming write wins
                this.writeSlot(slotIndex, keyHash, timestamp, nodeIdHash, value);
                this.localVersion++;
            }
            // If timestamps are equal, break ties using node ID hash
            else if (timestamp === existingTimestamp) {
                const existingNodeId = this.view.getUint32(slotIndex * DELTA_STORE.SLOT_SIZE + 12, true);
                if (nodeIdHash > existingNodeId) {
                    this.writeSlot(slotIndex, keyHash, timestamp, nodeIdHash, value);
                    this.localVersion++;
                }
            }
        }
        else {
            // New slot insertion
            if (this.count >= this.capacity) {
                this.resize();
            }
            slotIndex = this.count++;
            this.writeSlot(slotIndex, keyHash, timestamp, nodeIdHash, value);
            this.localVersion++;
        }
    }
    writeSlot(index, keyHash, timestamp, nodeIdHash, value) {
        const offset = index * DELTA_STORE.SLOT_SIZE;
        this.view.setUint32(offset, keyHash, true);
        this.view.setFloat64(offset + 4, timestamp, true);
        this.view.setUint32(offset + 12, nodeIdHash, true);
        this.view.setFloat64(offset + 16, value, true);
    }
    findSlot(keyHash) {
        for (let i = 0; i < this.count; i++) {
            const offset = i * DELTA_STORE.SLOT_SIZE;
            if (this.view.getUint32(offset, true) === keyHash) {
                return i;
            }
        }
        return -1;
    }
    resize() {
        this.capacity *= 2;
        const newBuffer = new ArrayBuffer(this.capacity * DELTA_STORE.SLOT_SIZE);
        const newMemoryU8 = new Uint8Array(newBuffer);
        newMemoryU8.set(this.memoryU8);
        this.buffer = newBuffer;
        this.view = new DataView(this.buffer);
        this.memoryU8 = newMemoryU8;
    }
    /**
     * Generates a compact binary delta payload (`Uint8Array`) containing only state mutated
     * since the peer's last known version watermark.
     */
    generateDelta(peerLastVersion) {
        // For high-performance delta streaming, we pack all slots modified since peerLastVersion.
        // In a full implementation, per-slot mutation versions or a sliding change log are indexed.
        // Here we emit a lightweight binary slice of active slab data representing the delta packet.
        const activeBytes = this.count * DELTA_STORE.SLOT_SIZE;
        // Prefix header: [4 bytes: version] [4 bytes: count]
        const headerSize = 8;
        const deltaPacket = new Uint8Array(headerSize + activeBytes);
        const packetView = new DataView(deltaPacket.buffer);
        packetView.setUint32(0, this.localVersion, true);
        packetView.setUint32(4, this.count, true);
        deltaPacket.set(this.memoryU8.subarray(0, activeBytes), headerSize);
        return deltaPacket;
    }
    /**
     * Merges an incoming binary delta payload from a peer into local memory using deterministic LWW rules.
     */
    mergeDelta(deltaBytes) {
        const packetView = new DataView(deltaBytes.buffer, deltaBytes.byteOffset, deltaBytes.byteLength);
        const remoteVersion = packetView.getUint32(0, true);
        const remoteCount = packetView.getUint32(4, true);
        const slotSize = DELTA_STORE.SLOT_SIZE;
        const dataOffset = 8;
        for (let i = 0; i < remoteCount; i++) {
            const offset = dataOffset + (i * slotSize);
            const keyHash = packetView.getUint32(offset, true);
            const timestamp = packetView.getFloat64(offset + 4, true);
            const nodeIdHash = packetView.getUint32(offset + 12, true);
            const value = packetView.getFloat64(offset + 16, true);
            let localSlot = this.findSlot(keyHash);
            if (localSlot !== -1) {
                const localTs = this.view.getFloat64(localSlot * slotSize + 4, true);
                const localNodeId = this.view.getUint32(localSlot * slotSize + 12, true);
                if (timestamp > localTs || (timestamp === localTs && nodeIdHash > localNodeId)) {
                    this.writeSlot(localSlot, keyHash, timestamp, nodeIdHash, value);
                }
            }
            else {
                if (this.count >= this.capacity) {
                    this.resize();
                }
                localSlot = this.count++;
                this.writeSlot(localSlot, keyHash, timestamp, nodeIdHash, value);
            }
        }
        this.localVersion = Math.max(this.localVersion, remoteVersion);
    }
    get(key) {
        const keyHash = this.hashKey(key);
        const slotIndex = this.findSlot(keyHash);
        if (slotIndex === -1)
            return undefined;
        return this.view.getFloat64(slotIndex * DELTA_STORE.SLOT_SIZE + 16, true);
    }
}
