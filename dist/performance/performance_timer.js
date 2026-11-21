import { AsyncLocalStorage } from 'node:async_hooks';
import { performance } from 'node:perf_hooks';
const requestContext = new AsyncLocalStorage();
export class PERFORMANCE_TIMER {
    staff;
    timings = new Map();
    children = new Map(); // parentId -> child ids
    recordHandlers = new Set();
    gates = [];
    constructor(staff) {
        this.staff = staff;
    }
    currentScopeId() {
        const store = requestContext.getStore();
        if (store?.requestId)
            return store.requestId;
        return `scope-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    start(label, opts) {
        const scopeId = opts?.scopeId ?? this.currentScopeId();
        const id = `${scopeId}:${label}:${Date.now()}-${Math.random().toString(36).slice(2)}`;
        this.timings.set(id, {
            id, label, scopeId,
            parentId: opts?.parentId ?? null,
            start: performance.now(),
            end: 0, duration: 0, selfDuration: 0,
            success: false,
            checkpoints: [],
        });
        if (opts?.parentId) {
            if (!this.children.has(opts.parentId))
                this.children.set(opts.parentId, new Set());
            this.children.get(opts.parentId).add(id);
        }
        if (opts?.gates)
            this.gates.push(...opts.gates);
        return id;
    }
    /** Records a split without stopping the clock — pinpoints exactly where inside a function time went. */
    checkpoint(id, label) {
        const timing = this.timings.get(id);
        if (!timing)
            return;
        const now = performance.now();
        const last = timing.checkpoints[timing.checkpoints.length - 1];
        const sinceLast = last ? now - (timing.start + last.sinceStart) : now - timing.start;
        timing.checkpoints.push({
            label,
            at: now,
            sinceStart: now - timing.start,
            sinceLast,
        });
        if (!this.staff)
            return;
        // stamps live onto the bus, if wired — same wiretap pattern as everything else tonight
        this.staff?.send({ id, label, sinceStart: now - timing.start, sinceLast }, '[PERF_TIMER]', `${timing.scopeId}:checkpoint`);
    }
    end(id, opts) {
        const timing = this.timings.get(id);
        if (!timing)
            return;
        timing.end = performance.now();
        timing.duration = timing.end - timing.start;
        timing.success = opts?.success ?? true;
        if (opts?.error)
            timing.error = opts.error instanceof Error ? opts.error.message : String(opts.error);
        // inclusive time = total duration. self time = total minus time spent in direct children.
        const childIds = this.children.get(id);
        const childTime = childIds
            ? Array.from(childIds).reduce((sum, cid) => sum + (this.timings.get(cid)?.duration ?? 0), 0)
            : 0;
        timing.selfDuration = timing.duration - childTime;
        for (const gate of this.gates) {
            if (gate.match(timing))
                gate.execute(timing);
        }
        this.recordHandlers.forEach(h => h(timing));
        if (!this.staff)
            return;
        this.staff?.send(timing, '[PERF_TIMER]', `${timing.scopeId}:record`);
    }
    /** start → run → end, catches and records errors automatically. */
    async measure(label, fn, opts) {
        const id = this.start(label, opts);
        try {
            const result = await fn((cpLabel) => this.checkpoint(id, cpLabel));
            this.end(id, { success: true });
            return result;
        }
        catch (err) {
            this.end(id, { success: false, error: err });
            throw err;
        }
    }
    getTiming(id) {
        const t = this.timings.get(id);
        if (!t)
            return undefined;
        return { ...t, durationFormatted: `${t.duration.toFixed(3)}ms`, selfDurationFormatted: `${t.selfDuration.toFixed(3)}ms` };
    }
    getChildren(parentId) {
        const ids = this.children.get(parentId);
        if (!ids)
            return [];
        return Array.from(ids).map(id => this.timings.get(id)).filter(Boolean);
    }
    getReport(label) {
        const entries = Array.from(this.timings.values()).filter(t => t.end > 0 && (!label || t.label === label));
        if (entries.length === 0)
            return null;
        const durations = entries.map(e => e.duration).sort((a, b) => a - b);
        const pct = (p) => durations[Math.min(durations.length - 1, Math.floor(durations.length * p))];
        return {
            count: entries.length,
            successful: entries.filter(e => e.success).length,
            failed: entries.filter(e => !e.success).length,
            min: durations[0], max: durations[durations.length - 1],
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            p50: pct(0.5), p90: pct(0.9), p99: pct(0.99),
            minFormatted: `${durations[0].toFixed(3)}ms`,
            maxFormatted: `${durations[durations.length - 1].toFixed(3)}ms`,
            avgFormatted: `${(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(3)}ms`,
            p50Formatted: `${pct(0.5).toFixed(3)}ms`,
            p90Formatted: `${pct(0.9).toFixed(3)}ms`,
            p99Formatted: `${pct(0.99).toFixed(3)}ms`,
        };
    }
    /** Trace Event Format — openable directly in chrome://tracing, Perfetto, speedscope. */
    exportTrace(label) {
        const entries = Array.from(this.timings.values()).filter(t => t.end > 0 && (!label || t.label === label));
        const events = entries.flatMap(t => [
            { name: t.label, ph: 'B', ts: t.start * 1000, pid: 1, tid: t.scopeId, args: {} },
            { name: t.label, ph: 'E', ts: t.end * 1000, pid: 1, tid: t.scopeId, args: { success: t.success, error: t.error } },
            ...t.checkpoints.map(cp => ({ name: cp.label, ph: 'i', ts: cp.at * 1000, pid: 1, tid: t.scopeId, s: 't' })),
        ]);
        return JSON.stringify({ traceEvents: events }, null, 2);
    }
    onRecord(handler) {
        this.recordHandlers.add(handler);
        return () => this.recordHandlers.delete(handler);
    }
    /** Wrap an SSR request entry point so every start() call inside it auto-scopes without manual threading. */
    runInScope(requestId, fn) {
        return requestContext.run({ requestId }, fn);
    }
}
