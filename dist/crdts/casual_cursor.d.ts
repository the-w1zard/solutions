export type ReplicaId = string;
export type ParticipantId = string;
/** Stable identifier for a position in the underlying CRDT document. */
export type AnchorId = string;
export type AnchorSide = 'before' | 'after';
export interface CursorAnchor {
    /** ID of an existing CRDT item, paragraph, block, or document boundary. */
    readonly id: AnchorId;
    /** Whether the cursor sits immediately before or after that item. */
    readonly side: AnchorSide;
}
export interface CursorState {
    readonly participantId: ParticipantId;
    readonly anchor: CursorAnchor;
    /** Optional selection end; omit for a caret-only cursor. */
    readonly selectionAnchor?: CursorAnchor;
    readonly color?: string;
    readonly name?: string;
    readonly hlc: string;
    readonly replicaId: ReplicaId;
}
export type CausalContext = Record<ReplicaId, string>;
export interface CursorCRDTState {
    cursors: Record<ParticipantId, CursorState>;
    context: CausalContext;
}
export interface CursorCRDTDelta {
    cursors: Record<ParticipantId, CursorState>;
    context: CausalContext;
}
export interface HLC {
    readonly physical: number;
    readonly logical: number;
    readonly replicaId: ReplicaId;
}
export interface CausalCursorOptions {
    /** Stable, globally unique ID for this replica. */
    replicaId: ReplicaId;
    /**
     * Maximum milliseconds of inactivity before a participant cursor is
     * eligible for garbage collection. Defaults to 2 minutes.
     */
    presenceTtlMs?: number;
    /** Optional clock source; useful for deterministic tests. */
    now?: () => number;
}
/**
 * Compares two encoded HLCs.
 *
 * Returns:
 *  - negative if `a` is causally/order-wise before `b`
 *  - zero if identical
 *  - positive if `a` is after `b`
 */
export declare function compareHlc(a: string, b: string): number;
/** Merges causal contexts using the pointwise maximum HLC. */
export declare function mergeContext(a?: CausalContext, b?: CausalContext): CausalContext;
/** Returns true when `candidate` is causally after every watermark in context. */
export declare function isCausallyNewer(candidate: string, context: CausalContext): boolean;
export declare class CausalCursorCRDT {
    private readonly replicaId;
    private readonly presenceTtlMs;
    private readonly now;
    private physical;
    private logical;
    private cursors;
    private context;
    constructor(options: CausalCursorOptions);
    /**
     * Creates or updates this replica's cursor.
     *
     * The returned state is a delta safe to broadcast immediately. It can be
     * delivered more than once without changing the result.
     */
    setCursor(input: {
        participantId: ParticipantId;
        anchor: CursorAnchor;
        selectionAnchor?: CursorAnchor;
        color?: string;
        name?: string;
    }): CursorCRDTDelta;
    /** Removes this replica's cursor and returns a removal delta. */
    clearCursor(participantId: ParticipantId): CursorCRDTDelta;
    /**
     * Merges a remote full state.
     *
     * Merge is idempotent: applying the same state twice has no additional
     * effect. It is also commutative and associative.
     */
    merge(state: CursorCRDTState): void;
    /** Merges a delta. Safe to apply out of order and repeatedly. */
    mergeDelta(delta: CursorCRDTDelta): void;
    has(participantId: ParticipantId): boolean;
    get(participantId: ParticipantId): CursorState | undefined;
    /** Returns all currently live cursors. */
    values(): CursorState[];
    /** Returns the full state for persistence or initial peer synchronization. */
    getState(): CursorCRDTState;
    /**
     * Returns changes not represented by `since`.
     *
     * Use this for periodic synchronization instead of repeatedly sending the
     * complete state.
     */
    getDelta(since?: CursorCRDTState): CursorCRDTDelta;
    /**
     * Removes cursors whose latest update is older than the presence TTL.
     *
     * This is eventual GC, not correctness-critical conflict resolution: a
     * disconnected participant can be reintroduced by a later cursor update.
     */
    collectInactive(): number;
    private shouldReplace;
    private nextHlc;
    private observe;
    private createDelta;
}
