/**
 * High-Performance Binary Grow-Only Set (G-Set) CRDT
 * Backed by a contiguous ArrayBuffer slab with sorted hashes for zero-allocation performance.
 */
export class G_SET {
    buffer;
    view;
    memoryU8;
    /**
     * Slot layout per Element Record (16 bytes):
     * [0..3]   Element Hash (Uint32) - Maintained in strictly sorted ascending order
     * [4..11]  Metadata / Insertion Epoch or Payload (Float64)
     * [12..15] Reserved / Alignment Padding (4 bytes)
     */
    static SLOT_SIZE = 16;
    capacity;
    count = 0;
    constructor(initialCapacity = 1024) {
        this.capacity = initialCapacity;
        this.buffer = new ArrayBuffer(this.capacity * G_SET.SLOT_SIZE);
        this.view = new DataView(this.buffer);
        this.memoryU8 = new Uint8Array(this.buffer);
    }
    hashString(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    /**
     * Adds an element to the set. If the element already exists, it is a no-op.
     * Maintains sorted order using binary search and shifting for $O(\log n)$ lookup and $O(n)$ insertion.
     */
    add(element, metadata = 0) {
        const elementHash = this.hashString(element);
        const index = this.findIndexOrInsertionPoint(elementHash);
        // If exact hash already exists, element is already present (Grow-Only invariant)
        if (index >= 0 && index < this.count && this.view.getUint32(index * G_SET.SLOT_SIZE, true) === elementHash) {
            return false;
        }
        // Insertion point is returned as bitwise NOT if negative
        const insertAt = index < 0 ? ~index : index;
        if (this.count >= this.capacity) {
            this.resize();
        }
        // Shift existing elements to maintain sorted order
        if (insertAt < this.count) {
            const byteOffset = insertAt * G_SET.SLOT_SIZE;
            const moveBytes = (this.count - insertAt) * G_SET.SLOT_SIZE;
            this.memoryU8.copyWithin(byteOffset + G_SET.SLOT_SIZE, byteOffset, byteOffset + moveBytes);
        }
        // Write new record
        this.writeSlot(insertAt, elementHash, metadata);
        this.count++;
        return true;
    }
    /**
     * Evaluates whether an element is present in the G-Set using $O(\log n)$ binary search.
     */
    has(element) {
        const elementHash = this.hashString(element);
        const index = this.findIndexOrInsertionPoint(elementHash);
        return index >= 0 && index < this.count && this.view.getUint32(index * G_SET.SLOT_SIZE, true) === elementHash;
    }
    findIndexOrInsertionPoint(hash) {
        let low = 0;
        let high = this.count - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const midHash = this.view.getUint32(mid * G_SET.SLOT_SIZE, true);
            if (midHash === hash) {
                return mid;
            }
            else if (midHash < hash) {
                low = mid + 1;
            }
            else {
                high = mid - 1;
            }
        }
        return ~low; // Bitwise NOT of insertion index
    }
    writeSlot(index, elementHash, metadata) {
        const offset = index * G_SET.SLOT_SIZE;
        this.view.setUint32(offset, elementHash, true);
        this.view.setFloat64(offset + 4, metadata, true);
    }
    resize() {
        this.capacity *= 2;
        const newBuffer = new ArrayBuffer(this.capacity * G_SET.SLOT_SIZE);
        const newMemoryU8 = new Uint8Array(newBuffer);
        newMemoryU8.set(this.memoryU8);
        this.buffer = newBuffer;
        this.view = new DataView(this.buffer);
        this.memoryU8 = newMemoryU8;
    }
    /**
     * Generates a compact binary delta payload (`Uint8Array`) containing the active slab data.
     */
    generateDelta() {
        const activeBytes = this.count * G_SET.SLOT_SIZE;
        const headerSize = 4; // 4 bytes for count
        const packet = new Uint8Array(headerSize + activeBytes);
        const packetView = new DataView(packet.buffer);
        packetView.setUint32(0, this.count, true);
        packet.set(this.memoryU8.subarray(0, activeBytes), headerSize);
        return packet;
    }
    /**
     * Merges a remote binary delta payload into the local set via high-speed set union.
     */
    mergeDelta(deltaBytes) {
        const packetView = new DataView(deltaBytes.buffer, deltaBytes.byteOffset, deltaBytes.byteLength);
        const remoteCount = packetView.getUint32(0, true);
        const slotSize = G_SET.SLOT_SIZE;
        const dataOffset = 4;
        for (let i = 0; i < remoteCount; i++) {
            const offset = dataOffset + (i * slotSize);
            const elementHash = packetView.getUint32(offset, true);
            const metadata = packetView.getFloat64(offset + 4, true);
            // Fast insertion leveraging G-Set monotonic growth property
            const index = this.findIndexOrInsertionPoint(elementHash);
            if (index < 0) {
                const insertAt = ~index;
                if (this.count >= this.capacity) {
                    this.resize();
                }
                if (insertAt < this.count) {
                    const byteOffset = insertAt * slotSize;
                    const moveBytes = (this.count - insertAt) * slotSize;
                    this.memoryU8.copyWithin(byteOffset + slotSize, byteOffset, byteOffset + moveBytes);
                }
                this.writeSlot(insertAt, elementHash, metadata);
                this.count++;
            }
        }
    }
    get size() {
        return this.count;
    }
}
