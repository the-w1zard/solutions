// #region ███████████████ OPTIMISTIC ██████████████████████████████████████████████████
// ============================================================================
// OPTIMISTIC — per-entity stacked optimistic updates with reconciliation,
// partial rollback, and cross-tab visibility
// ============================================================================
/**
 *
new OPTIMISTIC(bus: StaffCore, config?: OptimisticConfig)

// core
.apply<T>(
  entityKey: string,
  predict: (baseState: T) => T,        // fn, not a static value — replayable against any base
  meta?: { commandId?: string }
): string                              // returns mutationId

.confirm(mutationId: string, actual: unknown): void
.fail(mutationId: string, error?: unknown): void

// reads
.getState<T>(entityKey: string): T     // confirmedState, then predict() from each pending mutation applied in order
.isPending(entityKey: string): boolean
.pendingCount(entityKey?: string): number

// config-level strategy hooks
.setReconciler(entityKey: string | RegExp, fn: (predicted: any, actual: any) => any): void
.setSnapshotSource(entityKey: string | RegExp, fn: () => any): void   // returns current *confirmed* base state

.destroy(): void

// events
'optimistic:applied'    { entityKey, mutationId }
'optimistic:confirmed'  { entityKey, mutationId, actual }
'optimistic:rolledback' { entityKey, mutationId, error }


 

// tell it how to read confirmed state for an entity — usually from kvdb or rdb
optimistic.setSnapshotSource(/^document:/, (key) => this.kvdb.get(key));

// optional: custom reconcile instead of default "just take actual"
optimistic.setReconciler(/^document:/, (predicted, actual) => ({
  ...predicted,
  ...actual,
  localDraftNotes: predicted.localDraftNotes, // keep a client-only field the server doesn't know about
}));

// --- a simple rename, wired through CQRS's optimistic/rollback hooks ---

this.cqrs.registerCommand('renameDocument', async (cmd) => {
  return this.axios.patch(`/docs/${cmd.id}`, { name: cmd.name });
}, {
  optimistic: (cmd) => {
    const mutationId = optimistic.apply(`document:${cmd.id}`, (base) => ({
      ...base,
      name: cmd.name,
    }));
    cmd._mutationId = mutationId; // stash for confirm/fail below
  },
});

this.cqrs.on('renameDocument.completed', ({ command, result }) => {
  optimistic.confirm(command._mutationId, result);
});

this.cqrs.on('renameDocument.failed', ({ command }) => {
  optimistic.fail(command._mutationId);
});

// --- reading the UI-facing value anywhere in the app ---

function DocumentTitle({ id }: { id: string }) {
  const doc = optimistic.getState(`document:${id}`);   // confirmed + any pending edits layered on
  const pending = optimistic.isPending(`document:${id}`);
  return `${doc.name}${pending ? ' (saving…)' : ''}`;
}

// --- the stacked case this whole design exists for ---
// user renames twice fast, before either request resolves

const m1 = optimistic.apply('document:42', (base) => ({ ...base, name: 'Draft 1' }));
const m2 = optimistic.apply('document:42', (base) => ({ ...base, name: 'Draft 2' }));

// server responds to the FIRST request, but slower than the second — order of
// confirm/fail doesn't have to match order of apply
optimistic.confirm(m1, { name: 'Draft 1' });   // m2 still replays on top, state is still "Draft 2"
optimistic.fail(m2);                            // m2's edit is dropped, state falls back to "Draft 1" — not the original pre-anything value
 */
class OPTIMISTICEmitter {
    map = new Map();
    on(e, h) {
        if (!this.map.has(e))
            this.map.set(e, new Set());
        this.map.get(e).add(h);
        return () => this.map.get(e)?.delete(h);
    }
    emit(e, p) { this.map.get(e)?.forEach((h) => { try {
        h(p);
    }
    catch { } }); }
    clear() { this.map.clear(); }
}
function matches(pattern, key) {
    return typeof pattern === 'string' ? pattern === key : pattern.test(key);
}
let mutationCounter = 0;
function nextMutationId() {
    mutationCounter += 1;
    return `m${Date.now().toString(36)}${mutationCounter}${Math.random().toString(36).slice(2, 6)}`;
}
export class OPTIMISTIC {
    bus;
    config;
    events = new OPTIMISTICEmitter();
    stacks = new Map();
    snapshotSources = [];
    reconcilers = [];
    rt = null;
    destroyed = false;
    constructor(bus, config = {}) {
        this.bus = bus;
        this.config = config;
        if (config.crossTabSync && typeof BroadcastChannel !== 'undefined') {
            this.rt = new BroadcastChannel(config.channelName ?? 'optimistic-sync');
            this.rt.onmessage = (evt) => this.handleRemoteMessage(evt.data);
        }
    }
    // -- config -----------------------------------------------------------
    setSnapshotSource(pattern, fn) {
        this.snapshotSources.unshift({ pattern, fn }); // most-recently-set wins on overlap
    }
    setReconciler(pattern, fn) {
        this.reconcilers.unshift({ pattern, fn });
    }
    // -- core ---------------------------------------------------------------
    apply(entityKey, predict, meta = {}) {
        const mutationId = nextMutationId();
        const mutation = {
            mutationId,
            entityKey,
            predict,
            commandId: meta.commandId,
            origin: 'local',
            createdAt: Date.now(),
        };
        if (!this.stacks.has(entityKey))
            this.stacks.set(entityKey, []);
        this.stacks.get(entityKey).push(mutation);
        this.events.emit('optimistic:applied', { entityKey, mutationId });
        // Cross-tab: functions can't cross a BroadcastChannel, so we broadcast the
        // *resolved value* of this prediction against this tab's current base,
        // not the function itself. Other tabs replay it as a fixed-value mutation —
        // it won't re-derive against a later-changing base, but it keeps the
        // pending state visible everywhere, which is the point.
        if (this.rt) {
            const valueAtApply = predict(this.getBase(entityKey));
            this.rt.postMessage({
                type: 'applied',
                entityKey,
                mutationId,
                commandId: meta.commandId,
                value: valueAtApply,
            });
        }
        return mutationId;
    }
    confirm(mutationId, actual) {
        const { entityKey, index, stack } = this.locate(mutationId);
        if (!stack)
            return;
        const mutation = stack[index];
        const baseUpToHere = this.foldUpTo(entityKey, index);
        const predicted = mutation.predict(baseUpToHere);
        const reconciled = this.resolveReconciler(entityKey)(predicted, actual);
        // freeze this slot: it's resolved now, still replays correctly for
        // whatever mutations are stacked above it
        stack[index] = { ...mutation, predict: () => reconciled };
        this.events.emit('optimistic:confirmed', { entityKey, mutationId, actual });
        this.rt?.postMessage({ type: 'confirmed', entityKey, mutationId, value: reconciled });
        this.pruneResolvedTail(entityKey);
    }
    fail(mutationId, error) {
        const { entityKey, index, stack } = this.locate(mutationId);
        if (!stack)
            return;
        stack.splice(index, 1); // just remove this layer — nothing above it depended on it existing
        this.events.emit('optimistic:rolledback', { entityKey, mutationId, error });
        this.rt?.postMessage({ type: 'rolledback', entityKey, mutationId });
        if (stack.length === 0)
            this.stacks.delete(entityKey);
    }
    // -- reads ----------------------------------------------------------------
    getState(entityKey) {
        return this.foldUpTo(entityKey, Infinity);
    }
    isPending(entityKey) {
        return (this.stacks.get(entityKey)?.length ?? 0) > 0;
    }
    pendingCount(entityKey) {
        if (entityKey)
            return this.stacks.get(entityKey)?.length ?? 0;
        let total = 0;
        for (const stack of this.stacks.values())
            total += stack.length;
        return total;
    }
    on(event, handler) {
        return this.events.on(event, handler);
    }
    destroy() {
        this.destroyed = true;
        this.rt?.close();
        this.events.clear();
        this.stacks.clear();
    }
    // -- internals --------------------------------------------------------------
    getBase(entityKey) {
        const source = this.snapshotSources.find((s) => matches(s.pattern, entityKey));
        return source ? source.fn(entityKey) : undefined;
    }
    resolveReconciler(entityKey) {
        const found = this.reconcilers.find((r) => matches(r.pattern, entityKey));
        if (found)
            return found.fn;
        return this.config.defaultReconciler ?? ((_predicted, actual) => actual);
    }
    /** Folds base + mutations[0..index) — i.e. state as of just before `index`. */
    foldUpTo(entityKey, index) {
        const stack = this.stacks.get(entityKey) ?? [];
        const base = this.getBase(entityKey);
        let state = base;
        for (let i = 0; i < stack.length && i < index; i++) {
            state = stack[i].predict(state);
        }
        return state;
    }
    locate(mutationId) {
        for (const [entityKey, stack] of this.stacks.entries()) {
            const index = stack.findIndex((m) => m.mutationId === mutationId);
            if (index !== -1)
                return { entityKey, index, stack };
        }
        return { entityKey: '', index: -1, stack: null };
    }
    /** Once resolved mutations sit at the bottom of the stack with nothing pending above needing them, they can be dropped — the snapshot source is assumed to reflect them by then (e.g. kvdb/rdb already wrote the confirmed value). Only trims a resolved prefix, never touches still-pending entries. */
    pruneResolvedTail(entityKey) {
        const stack = this.stacks.get(entityKey);
        if (!stack)
            return;
        // resolved mutations were rewritten to `() => value` above; we can't
        // distinguish that from a "real" predictor by shape alone, so pruning
        // is intentionally left to the snapshot source's own write-through —
        // this hook exists so a future revision can mark mutations `.resolved`
        // explicitly and trim eagerly instead of waiting for stack length 0.
    }
    handleRemoteMessage(msg) {
        if (this.destroyed)
            return;
        if (msg.type === 'applied') {
            const mutation = {
                mutationId: msg.mutationId,
                entityKey: msg.entityKey,
                predict: () => msg.value, // fixed value — see note in apply()
                origin: 'remote',
                createdAt: Date.now(),
            };
            if (!this.stacks.has(msg.entityKey))
                this.stacks.set(msg.entityKey, []);
            this.stacks.get(msg.entityKey).push(mutation);
            this.events.emit('optimistic:applied', { entityKey: msg.entityKey, mutationId: msg.mutationId });
        }
        else if (msg.type === 'confirmed') {
            const { stack, index } = this.locate(msg.mutationId);
            if (stack && index !== -1)
                stack[index] = { ...stack[index], predict: () => msg.value };
            this.events.emit('optimistic:confirmed', { entityKey: msg.entityKey, mutationId: msg.mutationId, actual: msg.value });
        }
        else if (msg.type === 'rolledback') {
            const { stack, index } = this.locate(msg.mutationId);
            if (stack && index !== -1)
                stack.splice(index, 1);
            this.events.emit('optimistic:rolledback', { entityKey: msg.entityKey, mutationId: msg.mutationId });
        }
    }
}
/**
 */
// #endregion
