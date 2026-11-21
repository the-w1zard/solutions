/**
const raft = await RAFT.create({ clusterId: 'expensive-op', nodeId: instanceId, peerIds: otherInstanceIds }, staff);

const clusterSemaphore = new SEMAPHORE({
  limit: 3,
  distributed: true,
  nodeId: instanceId,
  raft,
  leaseMs: 20_000,
});

const permit = await clusterSemaphore.acquire({ label: 'expensive-op', timeoutMs: 10_000 });
try {
  await doExpensiveClusterWideThrottledWork();
} finally {
  await permit.release();
}
   */
export declare class SEMAPHORE {
    private opts;
    private hlc;
    private active;
    private queue;
    private holders;
    private appliedIndex;
    private destroyed;
    constructor(config: SemaphoreConfig);
    acquire(opts?: {
        timeoutMs?: number;
        label?: string;
    }): Promise<Permit>;
    tryAcquire(opts?: {
        label?: string;
    }): Permit | null;
    stats(): {
        active: number;
        queued: number;
        oldestWaitMs: number;
        limit: number;
    };
    setLimit(n: number): void;
    destroy(): void;
    private acquireLocal;
    private insertFair;
    private removeFromQueue;
    private grantLocal;
    private releaseLocalById;
    private renewLocalById;
    private drainLocalQueue;
    private acquireDistributed;
    private wrapDistributedPermit;
    private releaseDistributed;
    private renewDistributed;
    /** Replays newly committed log entries in order, applying ACQUIRE/RELEASE/
     * RENEW against the local `holders` map — this is what makes every node's
     * view of "who currently holds a permit" converge to the same answer. */
    private static applyEntryPure;
    private applyEntry;
    private applyCommitted;
    /** Actually triggers compaction — call this periodically (e.g. from a
     * setInterval the constructor arms when distributed: true), not on every
     * commit. Without this being called, RAFT.log still grows forever even
     * though compact() exists — compaction only happens if something invokes it. */
    private armCompaction;
    private waitForCommitProgress;
}
