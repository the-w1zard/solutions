export class AW_SET {
    localNodeId;
    buffer;
    view;
    memoryU8;
    /**
     * Row layout (24 bytes):
     * [0..3]   Element Hash (u32)
     * [4..7]   Add Tag ID — creator's own sequence number at add time (u32)
     * [8..11]  Creator Node Hash (u32)
     * [12]     Status (u8: 0 active, 1 tombstoned)
     * [13..15] padding
     * [16..19] Remover Node Hash (u32, 0 if not removed)
     * [20..23] Remove Seq — remover's own sequence number at remove time (u32, 0 if not removed)
     */
    static SLOT_SIZE = 24;
    capacity;
    count = 0;
    elementStrings = [];
    elementNames = new Map();
    nodeNames = new Map();
    // this node's own action counter — shared by both add() and remove()
    localSeq = 0;
    // this node's current knowledge: nodeHash -> highest seq incorporated from that node
    knownSeq = new Map();
    // digests reported by peers we've directly synced with: peerNodeId -> their knownSeq (by nodeHash)
    peerDigests = new Map();
    localNodeIdHash;
    static textEncoder = new TextEncoder();
    static textDecoder = new TextDecoder();
    constructor(localNodeId, initialCapacity = 1024) {
        this.localNodeId = localNodeId;
        this.localNodeIdHash = this.hashString(localNodeId);
        this.nodeNames.set(this.localNodeIdHash, localNodeId);
        this.capacity = initialCapacity;
        this.buffer = new ArrayBuffer(this.capacity * AW_SET.SLOT_SIZE);
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
    bindName(registry, hash, name, kind) {
        const existing = registry.get(hash);
        if (existing === undefined)
            registry.set(hash, name);
        else if (existing !== name) {
            throw new Error(`AW_SET: hash collision for ${kind} identity — "${existing}" and "${name}" both hash to ${hash}.`);
        }
    }
    bumpKnown(nodeHash, seq) {
        const current = this.knownSeq.get(nodeHash) ?? 0;
        if (seq > current)
            this.knownSeq.set(nodeHash, seq);
    }
    // ───────────────────────────── core ops ─────────────────────────────
    add(element) {
        const elementHash = this.hashString(element);
        this.bindName(this.elementNames, elementHash, element, "element");
        const tagId = ++this.localSeq;
        if (this.count >= this.capacity)
            this.resize();
        const slot = this.count++;
        this.writeRow(slot, elementHash, tagId, this.localNodeIdHash, 0, 0, 0);
        this.elementStrings[slot] = element;
        this.bumpKnown(this.localNodeIdHash, tagId);
    }
    remove(element) {
        const elementHash = this.hashString(element);
        for (let i = 0; i < this.count; i++) {
            const offset = i * AW_SET.SLOT_SIZE;
            if (this.view.getUint32(offset, true) !== elementHash)
                continue;
            if (this.elementStrings[i] !== element)
                continue;
            if (this.view.getUint8(offset + 12) !== 0)
                continue; // already tombstoned
            const removeSeq = ++this.localSeq;
            this.view.setUint8(offset + 12, 1);
            this.view.setUint32(offset + 16, this.localNodeIdHash, true);
            this.view.setUint32(offset + 20, removeSeq, true);
            this.bumpKnown(this.localNodeIdHash, removeSeq);
        }
    }
    has(element) {
        const elementHash = this.hashString(element);
        for (let i = 0; i < this.count; i++) {
            const offset = i * AW_SET.SLOT_SIZE;
            if (this.view.getUint32(offset, true) === elementHash &&
                this.elementStrings[i] === element &&
                this.view.getUint8(offset + 12) === 0)
                return true;
        }
        return false;
    }
    values() {
        const seen = new Set();
        for (let i = 0; i < this.count; i++) {
            if (this.view.getUint8(i * AW_SET.SLOT_SIZE + 12) !== 0)
                continue;
            seen.add(this.elementStrings[i]);
        }
        return [...seen];
    }
    writeRow(index, elementHash, tagId, creatorHash, status, removerHash, removeSeq) {
        const offset = index * AW_SET.SLOT_SIZE;
        this.view.setUint32(offset, elementHash, true);
        this.view.setUint32(offset + 4, tagId, true);
        this.view.setUint32(offset + 8, creatorHash, true);
        this.view.setUint8(offset + 12, status);
        this.view.setUint32(offset + 16, removerHash, true);
        this.view.setUint32(offset + 20, removeSeq, true);
    }
    resize() {
        this.capacity *= 2;
        const newBuffer = new ArrayBuffer(this.capacity * AW_SET.SLOT_SIZE);
        const newMemoryU8 = new Uint8Array(newBuffer);
        newMemoryU8.set(this.memoryU8);
        this.buffer = newBuffer;
        this.view = new DataView(newBuffer);
        this.memoryU8 = newMemoryU8;
    }
    // ───────────────────────────── sync ─────────────────────────────
    get version() {
        return this.localSeq;
    }
    /** Digest of this node's current knowledge: nodeId -> highest seq incorporated. */
    buildDigest() {
        return new Map(this.knownSeq);
    }
    generateDelta(sinceVersion = 0) {
        const includedRows = [];
        const neededElementHashes = new Set();
        const neededNodeHashes = new Set();
        for (let i = 0; i < this.count; i++) {
            const offset = i * AW_SET.SLOT_SIZE;
            const tagId = this.view.getUint32(offset + 4, true);
            const removeSeq = this.view.getUint32(offset + 20, true);
            const rowVersion = Math.max(tagId, removeSeq);
            if (rowVersion <= sinceVersion)
                continue;
            includedRows.push(i);
            neededElementHashes.add(this.view.getUint32(offset, true));
            neededNodeHashes.add(this.view.getUint32(offset + 8, true));
            const removerHash = this.view.getUint32(offset + 16, true);
            if (removerHash !== 0)
                neededNodeHashes.add(removerHash);
        }
        const digest = this.buildDigest();
        for (const hash of digest.keys())
            neededNodeHashes.add(hash);
        const encode = (s) => AW_SET.textEncoder.encode(s);
        const elementEntries = [...neededElementHashes].map((h) => [h, this.elementNames.get(h)]);
        const nodeEntries = [...neededNodeHashes].map((h) => [h, this.nodeNames.get(h)]);
        const digestEntries = [...digest.entries()];
        const tableByteLength = (entries) => entries.reduce((sum, [, name]) => sum + 4 + 2 + encode(name).length, 0);
        const headerSize = 16;
        const totalSize = headerSize +
            tableByteLength(elementEntries) +
            tableByteLength(nodeEntries) +
            digestEntries.length * 8 +
            includedRows.length * AW_SET.SLOT_SIZE;
        const packet = new Uint8Array(totalSize);
        const packetView = new DataView(packet.buffer);
        let offset = 0;
        packetView.setUint32(offset, includedRows.length, true);
        offset += 4;
        packetView.setUint32(offset, elementEntries.length, true);
        offset += 4;
        packetView.setUint32(offset, nodeEntries.length, true);
        offset += 4;
        packetView.setUint32(offset, digestEntries.length, true);
        offset += 4;
        const writeTable = (entries) => {
            for (const [hash, name] of entries) {
                const bytes = encode(name);
                packetView.setUint32(offset, hash, true);
                offset += 4;
                packetView.setUint16(offset, bytes.length, true);
                offset += 2;
                packet.set(bytes, offset);
                offset += bytes.length;
            }
        };
        writeTable(elementEntries);
        writeTable(nodeEntries);
        for (const [hash, seq] of digestEntries) {
            packetView.setUint32(offset, hash, true);
            offset += 4;
            packetView.setUint32(offset, seq, true);
            offset += 4;
        }
        for (const i of includedRows) {
            const srcOffset = i * AW_SET.SLOT_SIZE;
            packet.set(this.memoryU8.subarray(srcOffset, srcOffset + AW_SET.SLOT_SIZE), offset);
            offset += AW_SET.SLOT_SIZE;
        }
        return packet;
    }
    /** senderNodeId: the peer you're directly syncing with (required — this is
     * what makes the digest trackable per-peer for compaction safety). */
    mergeDelta(deltaBytes, senderNodeId) {
        const packetView = new DataView(deltaBytes.buffer, deltaBytes.byteOffset, deltaBytes.byteLength);
        let offset = 0;
        const rowCount = packetView.getUint32(offset, true);
        offset += 4;
        const elementTableCount = packetView.getUint32(offset, true);
        offset += 4;
        const nodeTableCount = packetView.getUint32(offset, true);
        offset += 4;
        const digestCount = packetView.getUint32(offset, true);
        offset += 4;
        const readTable = (count, registry, kind) => {
            for (let i = 0; i < count; i++) {
                const hash = packetView.getUint32(offset, true);
                offset += 4;
                const len = packetView.getUint16(offset, true);
                offset += 2;
                const bytes = deltaBytes.subarray(offset, offset + len);
                offset += len;
                this.bindName(registry, hash, AW_SET.textDecoder.decode(bytes), kind);
            }
        };
        readTable(elementTableCount, this.elementNames, "element");
        readTable(nodeTableCount, this.nodeNames, "node");
        const receivedDigest = new Map();
        for (let i = 0; i < digestCount; i++) {
            const hash = packetView.getUint32(offset, true);
            offset += 4;
            const seq = packetView.getUint32(offset, true);
            offset += 4;
            receivedDigest.set(hash, seq);
        }
        this.peerDigests.set(senderNodeId, receivedDigest);
        for (let i = 0; i < rowCount; i++) {
            const rowOffset = offset + i * AW_SET.SLOT_SIZE;
            const elementHash = packetView.getUint32(rowOffset, true);
            const tagId = packetView.getUint32(rowOffset + 4, true);
            const creatorHash = packetView.getUint32(rowOffset + 8, true);
            const remoteStatus = packetView.getUint8(rowOffset + 12);
            const removerHash = packetView.getUint32(rowOffset + 16, true);
            const removeSeq = packetView.getUint32(rowOffset + 20, true);
            const elementName = this.elementNames.get(elementHash);
            const existingSlot = this.findTagSlot(elementHash, tagId, creatorHash);
            if (existingSlot !== -1) {
                const existingOffset = existingSlot * AW_SET.SLOT_SIZE;
                if (remoteStatus === 1 && this.view.getUint8(existingOffset + 12) === 0) {
                    this.view.setUint8(existingOffset + 12, 1);
                    this.view.setUint32(existingOffset + 16, removerHash, true);
                    this.view.setUint32(existingOffset + 20, removeSeq, true);
                }
            }
            else {
                if (this.count >= this.capacity)
                    this.resize();
                const slot = this.count++;
                this.writeRow(slot, elementHash, tagId, creatorHash, remoteStatus, removerHash, removeSeq);
                this.elementStrings[slot] = elementName;
            }
            this.bumpKnown(creatorHash, tagId);
            if (removerHash !== 0)
                this.bumpKnown(removerHash, removeSeq);
        }
        // fold the peer's reported digest into our own knowledge too — transitive gossip
        for (const [hash, seq] of receivedDigest)
            this.bumpKnown(hash, seq);
    }
    findTagSlot(elementHash, tagId, creatorHash) {
        for (let i = 0; i < this.count; i++) {
            const offset = i * AW_SET.SLOT_SIZE;
            if (this.view.getUint32(offset, true) === elementHash &&
                this.view.getUint32(offset + 4, true) === tagId &&
                this.view.getUint32(offset + 8, true) === creatorHash)
                return i;
        }
        return -1;
    }
    // ───────────────────────────── compaction ─────────────────────────────
    /** Drops tombstoned rows whose removal has been acknowledged — via digest —
     * by every peer this node has directly synced with (mergeDelta). A node
     * it has no digest for contributes nothing to the computed safety, so
     * nothing involving that node's activity compacts until a digest from
     * them has been received at least once. Returns rows dropped. */
    compact() {
        if (this.peerDigests.size === 0)
            return 0; // no peers synced yet — nothing is provably safe
        const globalMin = (nodeHash) => {
            let min = Infinity;
            for (const digest of this.peerDigests.values()) {
                min = Math.min(min, digest.get(nodeHash) ?? 0);
            }
            return min === Infinity ? 0 : min;
        };
        const keep = [];
        for (let i = 0; i < this.count; i++) {
            const offset = i * AW_SET.SLOT_SIZE;
            const status = this.view.getUint8(offset + 12);
            if (status !== 1) {
                keep.push(i);
                continue;
            }
            const removerHash = this.view.getUint32(offset + 16, true);
            const removeSeq = this.view.getUint32(offset + 20, true);
            const safe = removeSeq <= globalMin(removerHash);
            if (!safe)
                keep.push(i);
        }
        const removed = this.count - keep.length;
        if (removed === 0)
            return 0;
        const newElementStrings = [];
        keep.forEach((oldIndex, newIndex) => {
            const srcOffset = oldIndex * AW_SET.SLOT_SIZE;
            const dstOffset = newIndex * AW_SET.SLOT_SIZE;
            this.memoryU8.copyWithin(dstOffset, srcOffset, srcOffset + AW_SET.SLOT_SIZE);
            newElementStrings[newIndex] = this.elementStrings[oldIndex];
        });
        this.elementStrings = newElementStrings;
        this.count = keep.length;
        return removed;
    }
}
