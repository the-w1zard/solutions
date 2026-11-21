// causal-cursor-crdt.ts
//
// A state-based causal cursor CRDT for collaborative documents.
//
// Design:
// - One cursor per participant.
// - Cursor positions use stable anchors, not integer offsets.
// - Each update carries a Hybrid Logical Clock (HLC).
// - Each replica tracks the latest HLC observed from every replica.
// - A remote cursor update replaces the local one only when it is causally
//   newer, or when timestamps tie and its replica ID sorts higher.
// - Updates are idempotent, commutative, and associative.
// - Stale participant entries can be garbage-collected after a configurable
//   inactivity period.
const DEFAULT_PRESENCE_TTL_MS = 120_000;
function assertNonEmptyString(value, name) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new TypeError(`${name} must be a non-empty string.`);
    }
}
function encodeHlc(hlc) {
    return `${hlc.physical.toString(36).padStart(11, '0')}`
        + `:${hlc.logical.toString(36).padStart(6, '0')}`
        + `:${hlc.replicaId}`;
}
function decodeHlc(encoded) {
    const parts = encoded.split(':');
    if (parts.length !== 3) {
        throw new TypeError(`Invalid HLC: ${encoded}`);
    }
    const [physical, logical, replicaId] = parts;
    return {
        physical: Number.parseInt(physical, 36),
        logical: Number.parseInt(logical, 36),
        replicaId,
    };
}
/**
 * Compares two encoded HLCs.
 *
 * Returns:
 *  - negative if `a` is causally/order-wise before `b`
 *  - zero if identical
 *  - positive if `a` is after `b`
 */
export function compareHlc(a, b) {
    if (a === b)
        return 0;
    const left = decodeHlc(a);
    const right = decodeHlc(b);
    if (left.physical !== right.physical) {
        return left.physical - right.physical;
    }
    if (left.logical !== right.logical) {
        return left.logical - right.logical;
    }
    if (left.replicaId === right.replicaId)
        return 0;
    return left.replicaId < right.replicaId ? -1 : 1;
}
/** Merges causal contexts using the pointwise maximum HLC. */
export function mergeContext(a = {}, b = {}) {
    const result = { ...a };
    for (const [replicaId, hlc] of Object.entries(b)) {
        const current = result[replicaId];
        if (!current || compareHlc(hlc, current) > 0) {
            result[replicaId] = hlc;
        }
    }
    return result;
}
/** Returns true when `candidate` is causally after every watermark in context. */
export function isCausallyNewer(candidate, context) {
    const observed = context[candidate.split(':')[2]];
    return !observed || compareHlc(candidate, observed) > 0;
}
function cloneCursor(cursor) {
    return {
        ...cursor,
        anchor: { ...cursor.anchor },
        selectionAnchor: cursor.selectionAnchor
            ? { ...cursor.selectionAnchor }
            : undefined,
    };
}
function cloneState(state) {
    const cursors = Object.create(null);
    for (const [participantId, cursor] of Object.entries(state.cursors)) {
        cursors[participantId] = cloneCursor(cursor);
    }
    return {
        cursors,
        context: { ...state.context },
    };
}
export class CausalCursorCRDT {
    replicaId;
    presenceTtlMs;
    now;
    physical = 0;
    logical = 0;
    cursors = Object.create(null);
    context = Object.create(null);
    constructor(options) {
        assertNonEmptyString(options.replicaId, 'replicaId');
        this.replicaId = options.replicaId;
        this.presenceTtlMs = options.presenceTtlMs ?? DEFAULT_PRESENCE_TTL_MS;
        this.now = options.now ?? Date.now;
    }
    /**
     * Creates or updates this replica's cursor.
     *
     * The returned state is a delta safe to broadcast immediately. It can be
     * delivered more than once without changing the result.
     */
    setCursor(input) {
        assertNonEmptyString(input.participantId, 'participantId');
        assertNonEmptyString(input.anchor.id, 'anchor.id');
        if (input.anchor.side !== 'before'
            && input.anchor.side !== 'after') {
            throw new TypeError("anchor.side must be 'before' or 'after'.");
        }
        if (input.selectionAnchor) {
            assertNonEmptyString(input.selectionAnchor.id, 'selectionAnchor.id');
            if (input.selectionAnchor.side !== 'before'
                && input.selectionAnchor.side !== 'after') {
                throw new TypeError("selectionAnchor.side must be 'before' or 'after'.");
            }
        }
        const hlc = this.nextHlc();
        const cursor = {
            participantId: input.participantId,
            anchor: { ...input.anchor },
            selectionAnchor: input.selectionAnchor
                ? { ...input.selectionAnchor }
                : undefined,
            color: input.color,
            name: input.name,
            hlc,
            replicaId: this.replicaId,
        };
        this.cursors[input.participantId] = cursor;
        this.observe(hlc);
        return this.createDelta({
            cursors: {
                [input.participantId]: cloneCursor(cursor),
            },
            context: {
                [this.replicaId]: hlc,
            },
        });
    }
    /** Removes this replica's cursor and returns a removal delta. */
    clearCursor(participantId) {
        assertNonEmptyString(participantId, 'participantId');
        const hlc = this.nextHlc();
        delete this.cursors[participantId];
        this.observe(hlc);
        return this.createDelta({
            cursors: Object.create(null),
            context: {
                [this.replicaId]: hlc,
            },
        });
    }
    /**
     * Merges a remote full state.
     *
     * Merge is idempotent: applying the same state twice has no additional
     * effect. It is also commutative and associative.
     */
    merge(state) {
        if (!state || typeof state !== 'object') {
            throw new TypeError('CausalCursorCRDT.merge expects a valid state.');
        }
        this.context = mergeContext(this.context, state.context ?? {});
        for (const [participantId, remote] of Object.entries(state.cursors ?? {})) {
            const local = this.cursors[participantId];
            if (!local || this.shouldReplace(local, remote)) {
                this.cursors[participantId] = cloneCursor(remote);
            }
        }
        this.collectInactive();
    }
    /** Merges a delta. Safe to apply out of order and repeatedly. */
    mergeDelta(delta) {
        this.merge(delta);
    }
    has(participantId) {
        return Object.prototype.hasOwnProperty.call(this.cursors, participantId);
    }
    get(participantId) {
        return this.cursors[participantId]
            ? cloneCursor(this.cursors[participantId])
            : undefined;
    }
    /** Returns all currently live cursors. */
    values() {
        return Object.values(this.cursors).map(cloneCursor);
    }
    /** Returns the full state for persistence or initial peer synchronization. */
    getState() {
        return cloneState({
            cursors: this.cursors,
            context: this.context,
        });
    }
    /**
     * Returns changes not represented by `since`.
     *
     * Use this for periodic synchronization instead of repeatedly sending the
     * complete state.
     */
    getDelta(since) {
        const sinceCursors = since?.cursors ?? {};
        const cursors = Object.create(null);
        for (const [participantId, cursor] of Object.entries(this.cursors)) {
            const previous = sinceCursors[participantId];
            if (!previous || previous.hlc !== cursor.hlc) {
                cursors[participantId] = cloneCursor(cursor);
            }
        }
        return this.createDelta({
            cursors,
            context: this.context,
        });
    }
    /**
     * Removes cursors whose latest update is older than the presence TTL.
     *
     * This is eventual GC, not correctness-critical conflict resolution: a
     * disconnected participant can be reintroduced by a later cursor update.
     */
    collectInactive() {
        const cutoff = this.now() - this.presenceTtlMs;
        let removed = 0;
        for (const [participantId, cursor] of Object.entries(this.cursors)) {
            const timestamp = decodeHlc(cursor.hlc).physical;
            if (timestamp < cutoff) {
                delete this.cursors[participantId];
                removed++;
            }
        }
        return removed;
    }
    shouldReplace(local, remote) {
        const comparison = compareHlc(remote.hlc, local.hlc);
        if (comparison !== 0)
            return comparison > 0;
        // Deterministic tie-break for replicas that generate identical HLCs.
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
        return encodeHlc({
            physical: this.physical,
            logical: this.logical,
            replicaId: this.replicaId,
        });
    }
    observe(hlc) {
        const decoded = decodeHlc(hlc);
        const current = this.context[decoded.replicaId];
        if (!current || compareHlc(hlc, current) > 0) {
            this.context[decoded.replicaId] = hlc;
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
    createDelta(partial) {
        return {
            cursors: partial.cursors,
            context: partial.context,
        };
    }
}
