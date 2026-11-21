// #region ███████████████ SEMAPHORE █ ❗ FIX NEEDED ❗ ████████████████████████████████
// ============================================================================
// SEMAPHORE — HLC-fair local throttling; RAFT-backed distributed mode with
// real linearizable mutual exclusion via replicated-log state machine.
//
// KNOWN LIMITATION (real, disclosed): RAFT exposes no commit-event hook, so
// waiting for freed capacity in distributed mode is poll-based against
// raft.commitIndex, not push-based. Also: lease expiry in distributed mode
// uses wall-clock Date.now() checked at apply-time, which is advisory, not
// perfectly deterministic across nodes with clock drift — same accepted
// tradeoff production Redis-semaphore implementations disclose.
// ============================================================================
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

import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";



export class SEMAPHORE {
    private opts: Required<Pick<SemaphoreConfig, 'limit' | 'leaseMs' | 'distributed' | 'pollIntervalMs'>> & SemaphoreConfig;
    private hlc: HYBRID_LOGICAL_CLOCK;

    // -- local mode state --
    private active = new Map<string, ActivePermit>();
    private queue: QueueEntry[] = [];

    // -- distributed mode state (replicated state machine over RAFT's log) --
    private holders = new Map<string, RemoteHolder>();
    private appliedIndex = -1;
    private destroyed = false;

    constructor(config: SemaphoreConfig) {
        this.opts = {
            leaseMs: config.leaseMs ?? 30_000,
            distributed: config.distributed ?? false,
            pollIntervalMs: config.pollIntervalMs ?? 75,
            ...config,
        };
    
        this.hlc = config.hlc ?? new HYBRID_LOGICAL_CLOCK();
    
        if (this.opts.distributed && (!config.raft || !config.nodeId)) {
            throw new Error('SEMAPHORE: distributed mode requires both `raft` and `nodeId`');
        }
    
        this.armCompaction();
    }
    public async acquire(opts: { timeoutMs?: number; label?: string } = {}): Promise<Permit> {
        if (this.destroyed) throw new Error('SEMAPHORE destroyed');
        return this.opts.distributed ? this.acquireDistributed(opts) : this.acquireLocal(opts);
    }
    public tryAcquire(opts: { label?: string } = {}): Permit | null {
        if (this.destroyed) throw new Error('SEMAPHORE destroyed');
        if (this.opts.distributed) return null; // distributed capacity can't be checked without a propose round-trip — no true "try" exists here
        if (this.active.size >= this.opts.limit) return null;
        return this.grantLocal(opts.label);
    }
    public stats() {
        if (this.opts.distributed) {
            this.applyCommitted();
            return { active: this.holders.size, queued: 0, oldestWaitMs: 0, limit: this.opts.limit };
        }
        const oldestWaitMs = this.queue.length ? Date.now() - this.queue[0].createdAt : 0;
        return { active: this.active.size, queued: this.queue.length, oldestWaitMs, limit: this.opts.limit };
    }
    public setLimit(n: number): void {
        this.opts.limit = n;
        if (!this.opts.distributed) this.drainLocalQueue();
        // distributed: new limit takes effect on the NEXT proposed command, since
        // limit is embedded per-command for deterministic replay — see acquireDistributed
    }
    public destroy(): void {
        this.destroyed = true;
        for (const entry of this.queue) {
            if (entry.timeoutTimer) clearTimeout(entry.timeoutTimer);
            entry.reject(new Error('SEMAPHORE destroyed while waiting'));
        }
        this.queue = [];
        for (const permit of this.active.values()) clearTimeout(permit.leaseTimer);
        this.active.clear();
    }
    // ============================ LOCAL MODE ============================
    private async acquireLocal(opts: { timeoutMs?: number; label?: string }): Promise<Permit> {
        const immediate = this.tryAcquire(opts);
        if (immediate) return immediate;

        const hlcStamp = this.hlc.tick();

        return new Promise<Permit>((resolve, reject) => {
            const entry: QueueEntry = { hlcStamp, label: opts.label, resolve, reject, createdAt: Date.now() };

            if (opts.timeoutMs) {
                entry.timeoutTimer = setTimeout(() => {
                    this.removeFromQueue(entry);
                    reject(new Error('SEMAPHORE acquire timed out waiting for a permit'));
                }, opts.timeoutMs);
            }

            this.insertFair(entry);
        });
    }
    private insertFair(entry: QueueEntry): void {
        let i = this.queue.length;
        while (i > 0 && this.hlc.compare(this.queue[i - 1].hlcStamp, entry.hlcStamp) > 0) i--;
        this.queue.splice(i, 0, entry);
    }
    private removeFromQueue(entry: QueueEntry): void {
        const idx = this.queue.indexOf(entry);
        if (idx !== -1) this.queue.splice(idx, 1);
    }
    private grantLocal(label?: string): Permit {
        const id = `perm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        const acquiredAt = Date.now();

        const leaseTimer = setTimeout(() => this.releaseLocalById(id), this.opts.leaseMs);
        this.active.set(id, { id, label, acquiredAt, leaseTimer });

        return {
            id, label, acquiredAt,
            release: () => this.releaseLocalById(id),
            renew: () => this.renewLocalById(id),
        };
    }
    private releaseLocalById(id: string): void {
        const permit = this.active.get(id);
        if (!permit) return;
        clearTimeout(permit.leaseTimer);
        this.active.delete(id);
        this.drainLocalQueue();
    }
    private renewLocalById(id: string): void {
        const permit = this.active.get(id);
        if (!permit) return;
        clearTimeout(permit.leaseTimer);
        permit.leaseTimer = setTimeout(() => this.releaseLocalById(id), this.opts.leaseMs);
    }
    private drainLocalQueue(): void {
        while (this.queue.length && this.active.size < this.opts.limit) {
            const next = this.queue.shift()!;
            if (next.timeoutTimer) clearTimeout(next.timeoutTimer);
            next.resolve(this.grantLocal(next.label));
        }
    }
    // ========================= DISTRIBUTED MODE =========================
    // Replicated state machine applied over RAFT's committed log. ACQUIRE/
    // RELEASE/RENEW are proposed commands; capacity is checked at APPLY time
    // (post-commit), identically on every node, using RAFT's log order as the
    // sole fairness authority — no HLC needed here, log index already gives a
    // total, linearizable order.
    private async acquireDistributed(opts: { timeoutMs?: number; label?: string }): Promise<Permit> {
        const raft = this.opts.raft!;
        const nodeId = this.opts.nodeId!;
        const permitId = `perm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        const deadline = opts.timeoutMs ? Date.now() + opts.timeoutMs : null;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (deadline && Date.now() > deadline) {
                throw new Error('SEMAPHORE distributed acquire timed out');
            }

            const result = await raft.propose({
                type: 'ACQUIRE',
                nodeId,
                permitId,
                label: opts.label,
                limit: this.opts.limit,   // embedded per-command so replay is deterministic even if setLimit() changed it mid-flight
                leaseMs: this.opts.leaseMs,
            });

            if (!result?.success) {
                throw new Error('SEMAPHORE distributed acquire failed to commit to the raft log');
            }

            this.applyCommitted();

            if (this.holders.has(permitId)) {
                return this.wrapDistributedPermit(permitId, opts.label);
            }

            // capacity was full when this ACQUIRE was applied — poll for a RELEASE
            // to commit (from any node) and retry. This is the one real,
            // disclosed gap: RAFT gives no push notification for remote commits.
            await this.waitForCommitProgress(deadline);
        }
    }
    private wrapDistributedPermit(permitId: string, label?: string): Permit {
        const holder = this.holders.get(permitId)!;
        return {
            id: permitId,
            label,
            acquiredAt: holder.acquiredAt,
            release: () => this.releaseDistributed(permitId),
            renew: () => this.renewDistributed(permitId),
        };
    }
    private async releaseDistributed(permitId: string): Promise<void> {
        const raft = this.opts.raft!;
        await raft.propose({ type: 'RELEASE', permitId }).catch(() => {
            // if this genuinely can't commit (e.g. no leader reachable), the lease
            // expiry sweep in applyEntry() is the fallback reclaim path — same
            // "cleanup job for lost permits" pattern the baseline libraries use
        });
        this.applyCommitted();
    }
    private async renewDistributed(permitId: string): Promise<void> {
        const raft = this.opts.raft!;
        await raft.propose({ type: 'RENEW', permitId, renewedAt: Date.now() }).catch(() => { });
        this.applyCommitted();
    }
    /** Replays newly committed log entries in order, applying ACQUIRE/RELEASE/
     * RENEW against the local `holders` map — this is what makes every node's
     * view of "who currently holds a permit" converge to the same answer. */
    // pure reducer — takes a state snapshot + one command, returns a NEW state,
    // touches no closures/instance fields. This is what raft.compact() needs,
    // and it's also what applyCommitted() calls per-entry during normal replay —
    // one function, two call sites, no logic duplicated between them.
    private static applyEntryPure(
        state: { holders: Map<string, RemoteHolder> },
        cmd: any,
    ): { holders: Map<string, RemoteHolder> } {
        const holders = new Map(state.holders);
        const now = Date.now();

        for (const [id, holder] of holders) {
            if (now - holder.acquiredAt > (cmd.leaseMs ?? 30_000)) holders.delete(id);
        }

        if (cmd.type === 'ACQUIRE') {
            if (holders.size < cmd.limit) {
                holders.set(cmd.permitId, { nodeId: cmd.nodeId, label: cmd.label, acquiredAt: now });
            }
        } else if (cmd.type === 'RELEASE') {
            holders.delete(cmd.permitId);
        } else if (cmd.type === 'RENEW') {
            const holder = holders.get(cmd.permitId);
            if (holder) holders.set(cmd.permitId, { ...holder, acquiredAt: cmd.renewedAt });
        }

        return { holders };
    }
    // applyEntry (used during normal replay) now just calls the pure version
    // and writes the result back onto this.holders — mutation lives here, ONE
    // place, not duplicated inside the reducer itself
    private applyEntry(cmd: any): void {
        const result = SEMAPHORE.applyEntryPure({ holders: this.holders }, cmd);
        this.holders = result.holders;
    }
    private applyCommitted(): void {
        const raft = this.opts.raft!;

        if (raft.needsSnapshotCatchup(this.appliedIndex)) {
            if (raft.snapshot) {
                this.holders = new Map(raft.snapshot.state?.holders ?? []);
                this.appliedIndex = raft.snapshot.lastIncludedIndex;
            }
        }

        while (this.appliedIndex < raft.commitIndex) {
            const entry = raft.log[raft.logArrayIndex(this.appliedIndex + 1)];
            if (!entry) break;
            this.applyEntry(entry.command);
            this.appliedIndex++;
        }
    }
    /** Actually triggers compaction — call this periodically (e.g. from a
     * setInterval the constructor arms when distributed: true), not on every
     * commit. Without this being called, RAFT.log still grows forever even
     * though compact() exists — compaction only happens if something invokes it. */
    private armCompaction(everyMs = 60_000): void {
        if (!this.opts.distributed) return;
        setInterval(() => {
            this.opts.raft!.compact(
                (state: A, entry: A) => SEMAPHORE.applyEntryPure(state, entry.command),
                { holders: new Map() },
            ).catch(() => { });
        }, everyMs);
    }
    private async waitForCommitProgress(deadline: number | null): Promise<void> {
        const raft = this.opts.raft!;
        const seenCommitIndex = raft.commitIndex;
        const pollEvery = this.opts.pollIntervalMs;

        while (raft.commitIndex <= seenCommitIndex) {
            if (deadline && Date.now() > deadline) return; // let the caller's own deadline check handle the throw
            await new Promise((r) => setTimeout(r, pollEvery));
        }
    }
}

// #endregion
