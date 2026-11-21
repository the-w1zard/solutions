//                                    SCHEDULER
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
// per-priority tier -> per-scope queue. Round-robining scopes within a tier is what
// stops one request's background work from starving another request at the same priority.
import { microtask } from "./microtasks";
export const PRIORITY_ORDER = ['immediate', 'user-blocking', 'normal', 'background', 'idle'];
export const GLOBAL_SCOPE = Symbol('global-scope');
export const queues = {
    immediate: new Map(), 'user-blocking': new Map(), normal: new Map(), background: new Map(), idle: new Map()
};
export const scopeCursors = { immediate: 0, 'user-blocking': 0, normal: 0, background: 0, idle: 0 };
let loopScheduled = false;
let currentScope = GLOBAL_SCOPE;
export function enqueue(task) {
    if (task.priority === 'immediate') {
        microtask(() => runOne(task));
        return;
    }
    const tier = queues[task.priority];
    if (!tier.has(task.scope))
        tier.set(task.scope, []);
    tier.get(task.scope).push(task);
    scheduleLoop();
}
export function scheduleLoop() {
    if (loopScheduled)
        return;
    loopScheduled = true;
    setImmediate(drainOne);
}
export function pickNext() {
    for (const p of PRIORITY_ORDER) {
        if (p === 'immediate')
            continue;
        const tier = queues[p];
        if (tier.size === 0)
            continue;
        const scopes = Array.from(tier.keys());
        const idx = scopeCursors[p] % scopes.length;
        const scope = scopes[idx];
        const list = tier.get(scope);
        const task = list.shift();
        if (list.length === 0)
            tier.delete(scope);
        scopeCursors[p] = idx + 1;
        return MaybePromise(task);
    }
    return undefined;
}
function runOne(task) {
    if (task.cancelled || task.signal?.aborted)
        return;
    const prev = currentScope;
    currentScope = task.scope;
    try {
        task.fn();
    }
    finally {
        currentScope = prev;
    }
}
function drainOne() {
    loopScheduled = false;
    const task = pickNext();
    if (task)
        runOne(task);
    if (Object.values(queues).some(m => m.size > 0))
        scheduleLoop();
}
export function schedule(fn, opts = {}) {
    const task = { priority: opts.priority ?? 'normal', scope: opts.scope ?? currentScope, fn, signal: opts.signal, cancelled: false };
    // signals.chains().sc.addEventListener('abort', () => { task.cancelled = true })
    enqueue(task);
    return {
        cancel() { task.cancelled = true; },
        reprioritize(next) {
            if (task.cancelled || next === task.priority)
                return;
            const old = queues[task.priority].get(task.scope);
            if (old) {
                const i = old.indexOf(task);
                if (i !== -1)
                    old.splice(i, 1);
                if (old.length === 0)
                    queues[task.priority].delete(task.scope);
            }
            task.priority = next;
            enqueue(task);
        }
    };
}
export function withRequestScope(requestId, fn) {
    const prev = currentScope;
    currentScope = requestId;
    try {
        return fn();
    }
    finally {
        currentScope = prev;
    }
} // Deliberately always re-enters at 'normal', regardless of the caller's own priority —
// yielding must never let a background task's continuation cut ahead of pending
// user-blocking work just because it called yieldToScheduler().
export function yieldToScheduler() {
    return new Promise((resolve) => { schedule(() => resolve(), { priority: 'normal', scope: currentScope }); });
}
export function scheduleChunked(work, opts = {}) {
    const iterator = Symbol.iterator in work ? work[Symbol.iterator]() : work;
    const chunkBudgetMs = opts.chunkBudgetMs ?? 5;
    const scope = opts.scope ?? currentScope;
    let cancelled = false;
    let priority = opts.priority ?? 'normal';
    function runChunk() {
        if (cancelled)
            return;
        const start = performance.now();
        while (true) {
            const { value: step, done } = iterator.next();
            if (done)
                return;
            step();
            const elapsed = performance.now() - start;
            if (elapsed >= chunkBudgetMs)
                break;
        }
        if (!cancelled)
            schedule(runChunk, { priority, scope });
    }
    schedule(runChunk, { priority, scope });
    return { cancel() { cancelled = true; }, reprioritize(next) { priority = next; } };
}
// #endregion
