/**
 * Manages tombstone lifecycles, causal watermark tracking across distributed peers,
 * and safe memory compaction for zero-dependency state engines.
 */
export class TOMBSTONE_COMPACTOR {
    gcGracePeriodMs;
    tombstones = new Map();
    peerWatermarks = new Map();
    globalMinWatermark = 0;
    constructor(gcGracePeriodMs = 5000) {
        this.gcGracePeriodMs = gcGracePeriodMs;
    }
    /**
     * Register or update a peer's latest causal acknowledgment watermark (e.g., lowest un-ACKed sequence or HLC).
     */
    updatePeerWatermark(nodeId, watermark) {
        this.peerWatermarks.set(nodeId, watermark);
        this.recalculateGlobalWatermark();
    }
    /**
     * Recalculates the global minimum watermark across all active peers.
     * Any tombstone older than this safe watermark has been observed and processed by every node.
     */
    recalculateGlobalWatermark() {
        if (this.peerWatermarks.size === 0) {
            this.globalMinWatermark = 0;
            return;
        }
        let min = Infinity;
        for (const [, mark] of this.peerWatermarks) {
            if (mark < min) {
                min = mark;
            }
        }
        this.globalMinWatermark = min === Infinity ? 0 : min;
    }
    /**
     * Record a new deletion tombstone into the engine.
     */
    recordTombstone(id, timestamp, generation = 1) {
        // Capture current peer watermarks as the causal context for this deletion
        const causalContext = new Map(this.peerWatermarks);
        this.tombstones.set(id, {
            id,
            deletedAt: timestamp,
            causalContext,
            generation
        });
    }
    /**
     * Checks if an entity ID is currently suppressed by an active tombstone.
     */
    isTombstoned(id, currentTimestamp) {
        const tombstone = this.tombstones.get(id);
        if (!tombstone)
            return false;
        // If a tombstone exists but is past grace period and safe, it can be bypassed or cleaned
        return true;
    }
    /**
     * Sweeps and garbage collects tombstones that have been fully acknowledged by all peers
     * and exceeded the grace period.
     */
    compact(currentTimestamp) {
        let removedCount = 0;
        let approximateBytesReclaimed = 0;
        for (const [id, tombstone] of this.tombstones.entries()) {
            const isAcknowledgeByAllPeers = this.isGloballyAcked(tombstone);
            const isPastGracePeriod = (currentTimestamp - tombstone.deletedAt) >= this.gcGracePeriodMs;
            // Safe to purge only when all peers have passed this causal watermark AND grace period elapsed
            if (isAcknowledgeByAllPeers && isPastGracePeriod) {
                this.tombstones.delete(id);
                removedCount++;
                approximateBytesReclaimed += id.length * 2 + 32; // Rough byte footprint estimation
            }
        }
        return {
            tombstonesRemoved: removedCount,
            bytesReclaimedApprox: approximateBytesReclaimed,
            activeWatermark: this.globalMinWatermark
        };
    }
    /**
     * Evaluates whether every connected peer has advanced past the tombstone's creation watermark.
     */
    isGloballyAcked(tombstone) {
        if (this.peerWatermarks.size === 0)
            return false;
        for (const [nodeId, requiredSeq] of tombstone.causalContext.entries()) {
            const currentPeerSeq = this.peerWatermarks.get(nodeId) || 0;
            if (currentPeerSeq < requiredSeq) {
                return false; // At least one peer has not yet acknowledged this causal frontier
            }
        }
        return true;
    }
    /**
     * Force clean up tombstones during node shutdown or snapshot rollover.
     */
    clear() {
        this.tombstones.clear();
        this.peerWatermarks.clear();
        this.globalMinWatermark = 0;
    }
}
