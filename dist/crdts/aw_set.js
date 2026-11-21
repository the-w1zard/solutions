// awset.ts
// Production-grade Add-Wins Set CRDT (Observed-Remove Set / OR-Set).
//
// Semantics:
// - add(element) creates a unique add tag.
// - remove(element) tombstones every add tag currently observed locally.
// - merge() is commutative, associative, and idempotent.
// - If add(x) and remove(x) happen concurrently, x remains present.
// - An element removed after its add has been observed stays removed.
function isPlainObject(value) {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}
/**
 * Stable canonical JSON serializer.
 * Object keys are sorted so equivalent objects serialize identically.
 */
function canonicalize(value) {
    if (Array.isArray(value)) {
        return value.map(canonicalize);
    }
    if (isPlainObject(value)) {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            result[key] = canonicalize(value[key]);
        }
        return result;
    }
    return value;
}
function defaultSerialize(value) {
    if (value === null
        || typeof value === 'string'
        || typeof value === 'number'
        || typeof value === 'boolean') {
        return value;
    }
    if (Array.isArray(value) || isPlainObject(value)) {
        return canonicalize(value);
    }
    throw new TypeError('AWSet requires a serialize() option for non-JSON-safe elements.');
}
function stableStringify(value) {
    return JSON.stringify(canonicalize(value));
}
function compareTags(a, b) {
    if (a.replica !== b.replica) {
        return a.replica < b.replica ? -1 : 1;
    }
    return a.counter - b.counter;
}
function dedupeTags(tags) {
    const sorted = [...tags].sort(compareTags);
    const result = [];
    for (const tag of sorted) {
        const previous = result[result.length - 1];
        if (!previous || compareTags(previous, tag) !== 0) {
            result.push(tag);
        }
    }
    return result;
}
function mergeTagLists(a = [], b = []) {
    return dedupeTags([...a, ...b]);
}
function mergeRecordTags(target, source) {
    let changed = false;
    for (const key of Object.keys(source)) {
        const merged = mergeTagLists(target[key], source[key]);
        if (!target[key] || merged.length !== target[key].length) {
            target[key] = merged;
            changed = true;
        }
    }
    return changed;
}
export class AWSet {
    replicaId;
    serialize;
    deserialize;
    counter = 0;
    adds = Object.create(null);
    removes = Object.create(null);
    constructor(options) {
        if (!options.replicaId || typeof options.replicaId !== 'string') {
            throw new TypeError('AWSet requires a non-empty replicaId.');
        }
        this.replicaId = options.replicaId;
        this.serialize = options.serialize ?? defaultSerialize;
        this.deserialize = options.deserialize;
    }
    /** Adds an element and returns its newly created add tag. */
    add(value) {
        const key = stableStringify(this.serialize(value));
        const tag = {
            replica: this.replicaId,
            counter: ++this.counter,
        };
        (this.adds[key] ??= []).push(tag);
        return tag;
    }
    /**
     * Removes every locally observed add tag for the element.
     *
     * Returns the number of tags tombstoned. A return value of 0 means this
     * replica had not observed any live add for the element.
     */
    remove(value) {
        const key = stableStringify(this.serialize(value));
        const liveTags = this.adds[key] ?? [];
        const existingRemovals = this.removes[key] ?? [];
        const newlyRemoved = liveTags.filter(tag => !existingRemovals.some(existing => compareTags(existing, tag) === 0));
        if (newlyRemoved.length === 0)
            return 0;
        this.removes[key] = mergeTagLists(existingRemovals, newlyRemoved);
        delete this.adds[key];
        return newlyRemoved.length;
    }
    has(value) {
        const key = stableStringify(this.serialize(value));
        return (this.adds[key]?.length ?? 0) > 0;
    }
    size() {
        return this.keys().length;
    }
    /** Returns the current effective elements. */
    values() {
        return this.keys().map(key => this.deserialize
            ? this.deserialize(key)
            : JSON.parse(key));
    }
    /** Returns stable serialized keys for all live elements. */
    keys() {
        return Object.keys(this.adds).filter(key => (this.adds[key]?.length ?? 0) > 0);
    }
    entries() {
        return this.keys().map(key => [
            key,
            this.deserialize ? this.deserialize(key) : JSON.parse(key),
        ]);
    }
    /** Merges another full state into this replica. Idempotent and commutative. */
    merge(state) {
        if (!state || typeof state !== 'object') {
            throw new TypeError('AWSet.merge expects a valid AWSetState.');
        }
        mergeRecordTags(this.adds, state.adds ?? {});
        mergeRecordTags(this.removes, state.removes ?? {});
        this.prune();
    }
    /** Merges a delta produced by add() or remove(). */
    mergeDelta(delta) {
        this.merge(delta);
    }
    /**
     * Removes tags that are both added and tombstoned.
     *
     * This is safe because a tombstone permanently cancels its matching add tag.
     * Call it periodically after merge; it reduces memory but does not change
     * the observable set.
     */
    prune() {
        for (const key of Object.keys(this.adds)) {
            const live = this.adds[key] ?? [];
            const removed = this.removes[key] ?? [];
            const remaining = live.filter(tag => !removed.some(tombstone => compareTags(tombstone, tag) === 0));
            if (remaining.length === 0) {
                delete this.adds[key];
            }
            else if (remaining.length !== live.length) {
                this.adds[key] = remaining;
            }
        }
    }
    /** Returns a deep copy of the complete CRDT state. */
    getState() {
        return {
            adds: this.cloneRecord(this.adds),
            removes: this.cloneRecord(this.removes),
        };
    }
    /**
     * Returns only the changes made locally since the supplied state.
     *
     * This is useful for efficient sync: send the delta rather than the full set.
     * The returned delta is safe to apply repeatedly.
     */
    getDelta(since) {
        const sinceAdds = since?.adds ?? {};
        const sinceRemoves = since?.removes ?? {};
        const adds = Object.create(null);
        const removes = Object.create(null);
        for (const key of Object.keys(this.adds)) {
            const missing = (this.adds[key] ?? []).filter(tag => !(sinceAdds[key] ?? []).some(known => compareTags(known, tag) === 0));
            if (missing.length > 0)
                adds[key] = missing;
        }
        for (const key of Object.keys(this.removes)) {
            const missing = (this.removes[key] ?? []).filter(tag => !(sinceRemoves[key] ?? []).some(known => compareTags(known, tag) === 0));
            if (missing.length > 0)
                removes[key] = missing;
        }
        return { adds, removes };
    }
    cloneRecord(source) {
        const result = Object.create(null);
        for (const key of Object.keys(source)) {
            result[key] = (source[key] ?? []).map(tag => ({ ...tag }));
        }
        return result;
    }
}
