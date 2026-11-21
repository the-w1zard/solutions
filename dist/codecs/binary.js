class BINARY_CORE {
    ser(value) {
        if (value instanceof Map) {
            return JSON.stringify({
                __type: 'Map',
                value: Array.from(value.entries()).map(([key, val]) => [this.ser(key), this.ser(val)])
            });
        }
        if (value instanceof Set) {
            return JSON.stringify({
                __type: 'Set',
                value: Array.from(value.values()).map(val => this.ser(val))
            });
        }
        if (Array.isArray(value)) {
            return JSON.stringify({
                __type: 'Array',
                value: value.map(item => this.ser(item))
            });
        }
        if (value !== null && typeof value === 'object') {
            const obj = {};
            for (const [key, val] of Object.entries(value)) {
                obj[key] = this.ser(val);
            }
            return JSON.stringify({
                __type: 'Object',
                value: obj
            });
        }
        // Wrap primitives (strings, numbers, booleans, null) to preserve exact types
        return JSON.stringify({
            __type: 'Primitive',
            value
        });
    }
    deser(raw) {
        if (raw === null || raw === undefined)
            return raw;
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (parsed?.__type === 'Map') {
                return new Map(parsed.value.map(([key, val]) => [this.deser(key), this.deser(val)]));
            }
            if (parsed?.__type === 'Set') {
                return new Set(parsed.value.map((val) => this.deser(val)));
            }
            if (parsed?.__type === 'Array') {
                return parsed.value.map((val) => this.deser(val));
            }
            if (parsed?.__type === 'Object') {
                const obj = {};
                for (const [key, val] of Object.entries(parsed.value)) {
                    obj[key] = this.deser(val);
                }
                return obj;
            }
            if (parsed?.__type === 'Primitive') {
                return parsed.value;
            }
            return parsed;
        }
        catch {
            return raw;
        }
    }
    encodeJSONEnvelope(envelope) { return new TextEncoder().encode(this.ser(envelope)); }
    decodeJSONEnvelope(bytes) { return this.deser(new TextDecoder().decode(bytes)); }
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    ensureAvailable(buf, pos, length) { if (pos < 0 || length < 0 || pos + length > buf.length)
        throw new Error("CBOR: truncated buffer"); }
    readUint(buf, pos) {
        this.ensureAvailable(buf, pos, 1);
        const info = buf[pos] & 0x1f;
        if (info <= 23)
            return [info, pos + 1];
        if (info === 24) {
            this.ensureAvailable(buf, pos + 1, 1);
            return [buf[pos + 1], pos + 2];
        }
        if (info === 25) {
            this.ensureAvailable(buf, pos + 1, 2);
            return [new DataView(buf.buffer, buf.byteOffset + pos + 1, 2).getUint16(0, false), pos + 3];
        }
        if (info === 26) {
            this.ensureAvailable(buf, pos + 1, 4);
            return [new DataView(buf.buffer, buf.byteOffset + pos + 1, 4).getUint32(0, false), pos + 5];
        }
        if (info === 27) {
            this.ensureAvailable(buf, pos + 1, 8);
            const value = new DataView(buf.buffer, buf.byteOffset + pos + 1, 8).getBigUint64(0, false);
            if (value > BigInt(Number.MAX_SAFE_INTEGER))
                throw new Error("CBOR: integer exceeds Number.MAX_SAFE_INTEGER");
            return [Number(value), pos + 9];
        }
        ;
        throw new Error(`CBOR: unsupported additional info ${info}`);
    }
    encodeUint64(majorShifted, n) {
        if (n <= 23n)
            return new Uint8Array([majorShifted | Number(n)]);
        if (n <= 0xffn) {
            return new Uint8Array([majorShifted | 24, Number(n)]);
        }
        if (n <= 0xffffn) {
            const b = new Uint8Array(3);
            b[0] = majorShifted | 25;
            new DataView(b.buffer).setUint16(1, Number(n), false);
            return b;
        }
        if (n <= 0xffffffffn) {
            const b = new Uint8Array(5);
            b[0] = majorShifted | 26;
            new DataView(b.buffer).setUint32(1, Number(n), false);
            return b;
        }
        const b = new Uint8Array(9);
        b[0] = majorShifted | 27;
        new DataView(b.buffer).setBigUint64(1, n, false);
        return b;
    }
    encode(value) {
        const parts = [];
        this.encodeValue(value, parts);
        const total = parts.reduce((n, p) => n + p.length, 0);
        const out = new Uint8Array(total);
        let offset = 0;
        for (const p of parts) {
            out.set(p, offset);
            offset += p.length;
        }
        return out;
    }
    encodeValue(v, out) {
        if (v === null) {
            out.push(new Uint8Array([0xf6]));
            return;
        }
        if (v === undefined) {
            out.push(new Uint8Array([0xf7]));
            return;
        }
        if (v === true) {
            out.push(new Uint8Array([0xf5]));
            return;
        }
        if (v === false) {
            out.push(new Uint8Array([0xf4]));
            return;
        }
        if (typeof v === 'number') {
            if (Number.isSafeInteger(v)) {
                if (v >= 0)
                    out.push(this.encodeUint64(0x00, BigInt(v)));
                else
                    out.push(this.encodeUint64(0x20, BigInt(-1 - v)));
            }
            else {
                const b = new Uint8Array(9);
                b[0] = 0xfb;
                new DataView(b.buffer).setFloat64(1, v, false);
                out.push(b);
            }
            return;
        }
        if (typeof v === 'string') {
            const encoded = this.encoder.encode(v);
            out.push(this.encodeUint(0x60, encoded.length));
            out.push(encoded);
            return;
        }
        if (v instanceof Uint8Array) {
            out.push(this.encodeUint(0x40, v.length));
            out.push(v);
            return;
        }
        if (Array.isArray(v)) {
            out.push(this.encodeUint(0x80, v.length));
            for (const item of v) {
                this.encodeValue(item, out);
            }
            return;
        }
        if (typeof v === 'object') {
            const proto = Object.getPrototypeOf(v);
            if (proto !== Object.prototype && proto !== null)
                throw new Error(`CBOR: unsupported object type ${v.constructor?.name ?? "unknown"}`);
            const keys = Object.keys(v);
            out.push(this.encodeUint(0xa0, keys.length));
            for (const key of keys) {
                this.encodeValue(key, out);
                this.encodeValue(v[key], out);
            }
            return;
        }
        ;
        throw new Error(`CBOR: unsupported value type ${typeof v}`);
    }
    encodeUint(majorShifted, n) {
        if (n <= 23)
            return new Uint8Array([majorShifted | n]);
        if (n <= 0xff)
            return new Uint8Array([majorShifted | 24, n]);
        if (n <= 0xffff) {
            const b = new Uint8Array(3);
            b[0] = majorShifted | 25;
            new DataView(b.buffer).setUint16(1, n, false);
            return b;
        }
        ;
        const b = new Uint8Array(5);
        b[0] = majorShifted | 26;
        new DataView(b.buffer).setUint32(1, n, false);
        return b;
    }
    decode(buf) {
        const [value, end] = this.decodeValue(buf, 0);
        if (end !== buf.length) {
            throw new Error("CBOR: trailing bytes");
        }
        ;
        return value;
    }
    decodeValue(buf, pos) {
        this.ensureAvailable(buf, pos, 1);
        const first = buf[pos];
        const major = first >> 5;
        const info = first & 0x1f;
        if (major === 7) {
            if (info === 20)
                return [false, pos + 1];
            if (info === 21)
                return [true, pos + 1];
            if (info === 22)
                return [null, pos + 1];
            if (info === 23)
                return [undefined, pos + 1];
            if (info === 27) {
                this.ensureAvailable(buf, pos + 1, 8);
                const dv = new DataView(buf.buffer, buf.byteOffset + pos + 1, 8);
                return [dv.getFloat64(0, false), pos + 9];
            }
        }
        const [n, nextPos] = this.readUint(buf, pos);
        if (major === 0)
            return [n, nextPos];
        if (major === 1)
            return [-1 - n, nextPos];
        if (major === 2) {
            this.ensureAvailable(buf, nextPos, n);
            const bytes = buf.slice(nextPos, nextPos + n);
            return [bytes, nextPos + n];
        }
        if (major === 3) {
            this.ensureAvailable(buf, nextPos, n);
            const bytes = buf.slice(nextPos, nextPos + n);
            return [this.decoder.decode(bytes), nextPos + n];
        }
        if (major === 4) {
            const arr = [];
            let p = nextPos;
            for (let i = 0; i < n; i++) {
                const [item, np] = this.decodeValue(buf, p);
                arr.push(item);
                p = np;
            }
            return [arr, p];
        }
        if (major === 5) {
            const obj = {};
            let p = nextPos;
            for (let i = 0; i < n; i++) {
                const [k, kp] = this.decodeValue(buf, p);
                const [v, vp] = this.decodeValue(buf, kp);
                obj[k] = v;
                p = vp;
            }
            return [obj, p];
        }
        ;
        throw new Error(`CBOR: unsupported major type ${major}`);
    }
    encode_msg(msg) {
        if (msg instanceof Uint8Array)
            return msg; // If it's already an encoded Uint8Array, don't re-encode it
        try {
            return this.encode(msg);
        }
        catch (err) {
            console.log("[BINARY_PIPE] Failed to encode outbound packet strictly:", err);
            return this.encode({ type: "error", error: "Encoding failed", id: msg?.id || "unknown" });
        }
    }
    decode_msg(raw) {
        if (!(raw instanceof Uint8Array) && !(typeof Buffer !== 'undefined' && Buffer.isBuffer(raw))) {
            console.error("[BINARY_PIPE] Protocol violation: Expected encoded Uint8Array data stream.");
            return null;
        }
        try {
            const uint8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw.buffer, raw.byteOffset, raw.length);
            return this.decode(uint8);
        }
        catch (err) {
            console.error("[BINARY_PIPE] Failed to decode inbound packet:", err);
            return null;
        }
    }
    HEADER_SIZE_BYTES = 64;
    HEADER_IDX_WRITE_HEAD = 0;
    HEADER_IDX_READ_HEAD = 1;
    HEADER_IDX_MUTEX = 2;
    HEADER_IDX_CAPACITY = 3;
    MUTEX_UNLOCKED = 0;
    MUTEX_LOCKED = 1;
    SENTINEL_WRAP_MARKER = 0xFFFFFFFF;
    createSharedDepotBuffer(capacityBytes) {
        // Enforce 64-byte alignment on capacity
        const alignedCapacity = Math.ceil(capacityBytes / 64) * 64;
        const totalSizeBytes = this.HEADER_SIZE_BYTES + alignedCapacity;
        const sab = new SharedArrayBuffer(totalSizeBytes);
        const headerView = new Int32Array(sab, 0, 4);
        // Initialize Header State
        Atomics.store(headerView, this.HEADER_IDX_WRITE_HEAD, 0);
        Atomics.store(headerView, this.HEADER_IDX_READ_HEAD, 0);
        Atomics.store(headerView, this.HEADER_IDX_MUTEX, this.MUTEX_UNLOCKED);
        Atomics.store(headerView, this.HEADER_IDX_CAPACITY, alignedCapacity);
        return sab;
    }
    mapDepotBuffer(sab) {
        // Map control slots (first 16 bytes containing 4 x Int32 values)
        const headerInt32 = new Int32Array(sab, 0, 4);
        // Read capacity directly from header slot
        const capacity = Atomics.load(headerInt32, this.HEADER_IDX_CAPACITY);
        // Map p slice strictly starting at byte 64
        const payloadUint8 = new Uint8Array(sab, this.HEADER_SIZE_BYTES, capacity);
        return {
            headerInt32,
            payloadUint8,
            capacity
        };
    }
    validateHeader(sab) {
        if (sab.byteLength < this.HEADER_SIZE_BYTES)
            return false;
        const headerInt32 = new Int32Array(sab, 0, 4);
        const capacity = Atomics.load(headerInt32, this.HEADER_IDX_CAPACITY);
        // Buffer length must equal 64 bytes header + registered capacity
        return sab.byteLength === this.HEADER_SIZE_BYTES + capacity;
    }
    calculateFrameFootprint(payloadSizeBytes) {
        const rawEnvelopeBytes = 4 + payloadSizeBytes;
        return Math.ceil(rawEnvelopeBytes / 4) * 4;
    }
    FLYWEIGHT_FRAME = {
        topicId: 0,
        topicName: undefined,
        p: new Uint8Array(0)
    };
    topicToIdMap = new Map();
    idToTopicMap = new Map();
    hashTopic(topic) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < topic.length; i++) {
            hash ^= topic.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193) >>> 0;
        }
        return hash;
    }
    getTopicId(topic) {
        const existingId = this.topicToIdMap.get(topic);
        if (existingId !== undefined) {
            return existingId;
        }
        const topicId = this.hashTopic(topic);
        const collisionTopic = this.idToTopicMap.get(topicId);
        if (collisionTopic !== undefined && collisionTopic !== topic) {
            throw new Error(`Topic hash collision detected between "${topic}" and "${collisionTopic}" (ID: ${topicId})`);
        }
        this.topicToIdMap.set(topic, topicId);
        this.idToTopicMap.set(topicId, topic);
        return topicId;
    }
    getTopicName(topicId) {
        return this.idToTopicMap.get(topicId);
    }
    registerTopics(topics) {
        for (const topic of topics) {
            this.getTopicId(topic);
        }
    }
    resetRegistry() {
        this.topicToIdMap.clear();
        this.idToTopicMap.clear();
    }
    textEncoder = new TextEncoder();
    // Reusable scratch buffer & DataView for header manipulations (Zero GC)
    headerBuffer = new ArrayBuffer(4);
    headerView = new DataView(this.headerBuffer);
    headerBytes = new Uint8Array(this.headerBuffer);
    encodeFrame(topic, p) {
        const topicId = this.getTopicId(topic);
        let payloadBytes;
        if (p instanceof Uint8Array) {
            payloadBytes = p;
        }
        else if (typeof p === "string") {
            payloadBytes = this.textEncoder.encode(p);
        }
        else {
            payloadBytes = this.textEncoder.encode(JSON.stringify(p));
        }
        const frame = new Uint8Array(4 + payloadBytes.byteLength);
        // 1. Write Uint32 Topic ID (Little-Endian) via byte copies (Zero DataView allocation)
        this.headerView.setUint32(0, topicId, true);
        frame.set(this.headerBytes, 0);
        // 2. Copy Payload Bytes
        frame.set(payloadBytes, 4);
        return frame;
    }
    decodeFrame(frameBytes) {
        if (frameBytes.byteLength < 4) {
            throw new Error("Invalid frame: buffer smaller than minimum header size (4 bytes).");
        }
        // Direct byte copy into static DataView to read Uint32 safely without memory allocation
        this.headerBytes[0] = frameBytes[0];
        this.headerBytes[1] = frameBytes[1];
        this.headerBytes[2] = frameBytes[2];
        this.headerBytes[3] = frameBytes[3];
        const topicId = this.headerView.getUint32(0, true);
        this.FLYWEIGHT_FRAME.topicId = topicId;
        this.FLYWEIGHT_FRAME.topicName = this.getTopicName(topicId);
        this.FLYWEIGHT_FRAME.p = frameBytes.subarray(4); // Zero-copy view
        return this.FLYWEIGHT_FRAME;
    }
}
export const BINARY = new BINARY_CORE();
