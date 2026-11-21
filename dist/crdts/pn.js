//                                    PN_COUNTER
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
// ============================================================================
// CRDTs — G/PN-Counter, OR-Set, LWW-Register. State-based (send full state,
// merge is idempotent/commutative/associative), with a delta() escape hatch
// on PN_COUNTER for bandwidth-conscious sync. HLC-driven, not wall-clock —
// LWW's "last write wins" correctness depends entirely on that.
//
// KNOWN GAP: no non-negative/bounded counter variant.
// Bounding a counter is a global invariant that can't be evaluated from
// local replica state alone — offering one honestly requires coordination,
// which defeats the point of a CRDT. Not solved here; flagged, not faked.
// ============================================================================
export class PN_COUNTER {
    nodeId;
    positive = {};
    negative = {};
    constructor(nodeId) {
        this.nodeId = nodeId;
    }
    increment(amount = 1) {
        this.positive[this.nodeId] = (this.positive[this.nodeId] ?? 0) + amount;
    }
    decrement(amount = 1) {
        this.negative[this.nodeId] = (this.negative[this.nodeId] ?? 0) + amount;
    }
    value() {
        const sum = (rec) => Object.values(rec).reduce((a, b) => a + b, 0);
        return sum(this.positive) - sum(this.negative);
    }
    /** Element-wise max merge — this is what makes concurrent increments
     * conflict-free: each node only ever grows its own slot, merge never loses
     * a contribution regardless of what order states arrive in. */
    merge(other) {
        const state = other instanceof PN_COUNTER ? other.getState() : other;
        for (const [node, count] of Object.entries(state.positive)) {
            this.positive[node] = Math.max(this.positive[node] ?? 0, count);
        }
        for (const [node, count] of Object.entries(state.negative)) {
            this.negative[node] = Math.max(this.negative[node] ?? 0, count);
        }
    }
    getState() {
        return { positive: { ...this.positive }, negative: { ...this.negative } };
    }
    setState(state) {
        this.positive = { ...state.positive };
        this.negative = { ...state.negative };
    }
    /** Only this replica's own slot — sufficient for merge() on the receiving
     * end (max() with an unrelated node's existing value is a no-op), and far
     * smaller than getState() once many nodes have contributed over time. This
     * is the delta-state escape hatch from the gap analysis — not a generic
     * DIFFPATCH integration, since the whole state here is already just two
     * flat node->number maps; diffing that would add overhead, not save it. */
    delta() {
        return {
            positive: this.nodeId in this.positive ? { [this.nodeId]: this.positive[this.nodeId] } : {},
            negative: this.nodeId in this.negative ? { [this.nodeId]: this.negative[this.nodeId] } : {},
        };
    }
}
// #endregion
