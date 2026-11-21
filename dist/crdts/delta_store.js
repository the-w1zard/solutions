// delta-store-crdt.ts
//
// Production-grade causal delta-state key-value CRDT.
//
// Semantics:
// - Each key is an LWW register: the highest HLC wins.
// - Identical HLCs resolve deterministically by replica ID.
// - Deletes create tombstones, preventing an older concurrent write from
//   resurrecting a key.
// - Every mutation returns a compact delta.
// - Deltas may arrive duplicated, delayed, or in any order.
// - merge() is commutative, associative, and idempotent.
// - prune() removes entries only after every replica has causally observed
//   the relevant update.
import { compareHlc, decodeHlc, encodeHlc } from "./utils";
const DEFAULT_MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
function assertNonEmptyString(value, name) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new TypeError(`${name} must be a non-empty string.`);
    }
}
function cloneVersion(version) {
    return { ...version };
}
function cloneValues(source = {}) {
    const result = Object.create(null);
    for (const [key, version] of Object.entries(source)) {
        result[key] = cloneVersion(version);
    }
    return result;
}
function cloneState(state) {
    return {
        values: cloneValues(state.values),
        context: {
            watermarks: { ...state.context?.watermarks },
        },
    };
}
export class DeltaStoreCRDT {
    replicaId;
    now;
    maxClockSkewMs;
    physical = 0;
    logical = 0;
    values = Object.create(null);
    watermarks = Object.create(null);
    constructor(options) {
        assertNonEmptyString(options.replicaId, 'replicaId');
        this.replicaId = options.replicaId;
        this.now = options.now ?? Date.now;
        this.maxClockSkewMs = options.maxClockSkewMs ?? DEFAULT_MAX_CLOCK_SKEW_MS;
    }
    /**
     * Writes a value and returns a delta containing only that write.
     *
     * A later write to the same key supersedes an earlier one once both are
     * observed. A concurrent write resolves by HLC, then replica ID.
     */
    set(key, value) {
        assertNonEmptyString(key, 'key');
        const hlc = this.nextHlc();
        const version = {
            value,
            hlc,
            replicaId: this.replicaId,
            deleted: false,
        };
        this.values[key] = version;
        this.observe(hlc);
        return this.createDelta({
            [key]: cloneVersion(version),
        });
    }
    /**
     * Deletes a key and returns a tombstone delta.
     *
     * The tombstone prevents an older write from resurrecting the key after
     * synchronization. A newer write can still intentionally restore it.
     */
    delete(key) {
        assertNonEmptyString(key, 'key');
        const hlc = this.nextHlc();
        const version = {
            value: null,
            hlc,
            replicaId: this.replicaId,
            deleted: true,
        };
        this.values[key] = version;
        this.observe(hlc);
        return this.createDelta({
            [key]: cloneVersion(version),
        });
    }
    /** Returns the current value, or undefined when absent or deleted. */
    get(key) {
        const version = this.values[key];
        if (!version || version.deleted)
            return undefined;
        return version.value;
    }
    /** Returns true only when the key has a live value. */
    has(key) {
        const version = this.values[key];
        return Boolean(version && !version.deleted);
    }
    /** Returns all live keys. */
    keys() {
        return Object.keys(this.values).filter(key => !this.values[key].deleted);
    }
    /** Returns all live values. */
    getAll() {
        return this.keys().map(key => this.values[key].value);
    }
    /** Returns live key/value pairs. */
    entries() {
        return this.keys().map(key => [key, this.values[key].value]);
    }
    size() {
        return this.keys().length;
    }
    /**
     * Merges a full remote state.
     *
     * Applying the same state multiple times has no additional effect.
     */
    merge(state) {
        if (!state || typeof state !== 'object') {
            throw new TypeError('DeltaStoreCRDT.merge expects a valid state.');
        }
        this.mergeWatermarks(state.context?.watermarks ?? {});
        for (const [key, remote] of Object.entries(state.values ?? {})) {
            const local = this.values[key];
            if (!local || this.shouldReplace(local, remote)) {
                this.values[key] = cloneVersion(remote);
            }
        }
    }
    /** Merges one or more deltas. Safe for duplicate and out-of-order delivery. */
    mergeDelta(delta) {
        const deltas = Array.isArray(delta) ? delta : [delta];
        for (const item of deltas) {
            this.merge(item);
        }
    }
    /**
     * Returns changes not represented by `since`.
     *
     * Use the returned delta for normal synchronization; it is substantially
     * smaller than the complete store after the initial sync.
     */
    getDelta(since) {
        const sinceValues = since?.values ?? {};
        const changed = Object.create(null);
        for (const [key, version] of Object.entries(this.values)) {
            const previous = sinceValues[key];
            if (!previous || previous.hlc !== version.hlc) {
                changed[key] = cloneVersion(version);
            }
        }
        return this.createDelta(changed);
    }
    /**
     * Returns the complete state for initial synchronization or persistence.
     */
    getState() {
        return cloneState({
            values: this.values,
            context: { watermarks: this.watermarks },
        });
    }
    /**
     * Removes history that every known replica has causally observed.
     *
     * A version is removable when its HLC is at or below every replica's
     * watermark. This prevents removing an update that a slow replica may still
     * need in order to resolve a future concurrent write correctly.
     */
    prune() {
        const watermarks = Object.values(this.watermarks);
        let removed = 0;
        for (const [key, version] of Object.entries(this.values)) {
            const isStable = watermarks.every(watermark => compareHlc(version.hlc, watermark) <= 0);
            if (isStable) {
                delete this.values[key];
                removed++;
            }
        }
        return removed;
    }
    /**
     * Removes only deleted tombstones that all known replicas have observed.
     *
     * This is the preferred production GC mode: it preserves live values while
     * reclaiming memory used by deletion history.
     */
    pruneTombstones() {
        const watermarks = Object.values(this.watermarks);
        let removed = 0;
        for (const [key, version] of Object.entries(this.values)) {
            if (!version.deleted)
                continue;
            const isStable = watermarks.every(watermark => compareHlc(version.hlc, watermark) <= 0);
            if (isStable) {
                delete this.values[key];
                removed++;
            }
        }
        return removed;
    }
    shouldReplace(local, remote) {
        const comparison = compareHlc(remote.hlc, local.hlc);
        if (comparison !== 0)
            return comparison > 0;
        // Deterministic tie-break for identical HLCs.
        return remote.replicaId > local.replicaId;
    }
    nextHlc() {
        const physicalNow = this.now();
        if (physicalNow > this.physical) {
            this.physical = physicalNow;
            this.logical = 0;
        }
        else {
            this.logical++;
        }
        // Reject extreme local-clock regressions/skew before it can dominate
        // conflict resolution.
        const maximumAccepted = physicalNow + this.maxClockSkewMs;
        if (this.physical > maximumAccepted) {
            throw new RangeError('Local clock is too far ahead; refusing to create an HLC.');
        }
        return encodeHlc({
            physical: this.physical,
            logical: this.logical,
            replicaId: this.replicaId,
        });
    }
    observe(hlc) {
        const decoded = decodeHlc(hlc);
        const current = this.watermarks[decoded.replicaId];
        if (!current || compareHlc(hlc, current) > 0) {
            this.watermarks[decoded.replicaId] = hlc;
        }
        if (decoded.physical > this.physical) {
            this.physical = decoded.physical;
            this.logical = 0;
        }
        else if (decoded.physical === this.physical
            && decoded.logical > this.logical) {
            this.logical = decoded.logical;
        }
    }
    mergeWatermarks(remote) {
        for (const [replicaId, hlc] of Object.entries(remote)) {
            const current = this.watermarks[replicaId];
            if (!current || compareHlc(hlc, current) > 0) {
                this.watermarks[replicaId] = hlc;
            }
        }
    }
    createDelta(values) {
        return {
            values,
            context: {
                watermarks: {
                    [this.replicaId]: this.watermarks[this.replicaId],
                },
            },
        };
    }
}
