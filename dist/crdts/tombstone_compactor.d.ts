/**
 * Represents a vector clock or peer acknowledgment watermark mapping Node ID -> Sequence / HLC epoch.
 */
export type PeerWatermarkMap = Map<string, number>;
export interface TombstoneRecord {
    id: string;
    /** Causal timestamp or logical clock when the deletion occurred */
    deletedAt: number;
    /** Vector clock snapshot of peer ACKs at the moment of deletion */
    causalContext: PeerWatermarkMap;
    /** Optional metadata or generation counter for tombstone validation */
    generation: number;
}
export interface CompactionStats {
    tombstonesRemoved: number;
    bytesReclaimedApprox: number;
    activeWatermark: number;
}
/**
 * Manages tombstone lifecycles, causal watermark tracking across distributed peers,
 * and safe memory compaction for zero-dependency state engines.
 */
export declare class TOMBSTONE_COMPACTOR {
    private readonly gcGracePeriodMs;
    private tombstones;
    private peerWatermarks;
    private globalMinWatermark;
    constructor(gcGracePeriodMs?: number);
    /**
     * Register or update a peer's latest causal acknowledgment watermark (e.g., lowest un-ACKed sequence or HLC).
     */
    updatePeerWatermark(nodeId: string, watermark: number): void;
    /**
     * Recalculates the global minimum watermark across all active peers.
     * Any tombstone older than this safe watermark has been observed and processed by every node.
     */
    private recalculateGlobalWatermark;
    /**
     * Record a new deletion tombstone into the engine.
     */
    recordTombstone(id: string, timestamp: number, generation?: number): void;
    /**
     * Checks if an entity ID is currently suppressed by an active tombstone.
     */
    isTombstoned(id: string, currentTimestamp: number): boolean;
    /**
     * Sweeps and garbage collects tombstones that have been fully acknowledged by all peers
     * and exceeded the grace period.
     */
    compact(currentTimestamp: number): CompactionStats;
    /**
     * Evaluates whether every connected peer has advanced past the tombstone's creation watermark.
     */
    private isGloballyAcked;
    /**
     * Force clean up tombstones during node shutdown or snapshot rollover.
     */
    clear(): void;
}
