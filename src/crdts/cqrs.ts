

// #region ███████████████ CQRS ████████████████████████████████████████████████████████
// ============================================================================
// CQRSBus — command/query/event mediator with offline queueing,
// optimistic apply, undo/redo, and cross-tab sync
// ============================================================================
/**
 * 
 * new CQRSBus(options)

.registerCommand<C, R>(type, handler, opts?: { optimistic?, idempotent?, offline? })
.registerQuery<Q, R>(type, handler, opts?: { ttlMs?, staleMs? })

.dispatch<C, R>(command): Promise<R>
.query<Q, R>(query): Promise<R>
.publish(event): void
.on(eventType, handler): () => void

.undo(): void
.redo(): void

.pendingOffline: number
.state: 'online' | 'offline'
 

bus.registerCommand('renameDocument', async (cmd) => {
  return api.patch(`/docs/${cmd.id}`, { name: cmd.name });
}, {
  optimistic: (cmd, state) => ({ ...state, name: cmd.name }),  // apply before server confirms
  idempotent: true,
  offline: true,                                                // queue if no network
});

bus.registerQuery('getDocument', async (q) => api.get(`/docs/${q.id}`), { ttlMs: 30_000 });

bus.on('documentRenamed', (evt) => refreshSidebar(evt));

await bus.dispatch({ type: 'renameDocument', id: '42', name: 'Q3 Report' });
const doc = await bus.query({ type: 'getDocument', id: '42' });  // cached across tabs
 */

 
class CQRSEmitter<M extends Record<string, any>> {
    private map = new Map<string, Set<(p: any) => void>>();
    on(e: string, h: (p: any) => void) {
        if (!this.map.has(e)) this.map.set(e, new Set());
        this.map.get(e)!.add(h);
        return () => this.map.get(e)?.delete(h);
    }
    emit(e: string, p: any) { this.map.get(e)?.forEach((h) => { try { h(p); } catch { } }); }
}
function queryKey(q: Query): string { return `${q.type}:${JSON.stringify(Object.fromEntries(Object.entries(q).filter(([k]) => k !== 'type')))}`; }

export class CQRS {
    private commandHandlers = new Map<string, { fn: CommandHandler; opts: CommandOpts }>();
    private queryHandlers = new Map<string, { fn: QueryHandler; opts: QueryOpts }>();
    private events = new CQRSEmitter();

    private queryCache = new Map<string, { data: any; ts: number; inflight?: Promise<any> }>();
    private seenIdempotencyKeys = new Set<string>();

    private offlineQueue: Command[] = [];
    private _state: 'online' | 'offline' = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online';

    private undoStack: UndoEntry[] = [];
    private redoStack: UndoEntry[] = [];

    private rt: BroadcastChannel | null = null;

    constructor(private opts: { channelName?: string; crossTabSync?: boolean } = {}) {
        if (opts.crossTabSync && typeof BroadcastChannel !== 'undefined') {
            this.rt = new BroadcastChannel(opts.channelName ?? 'cqrs-bus');
            this.rt.onmessage = (evt) => {
                const { type, p } = evt.data as { type: string; p: any };
                this.events.emit(type, p); // re-emit events broadcast from other tabs, don't re-dispatch commands
            };
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => { this._state = 'online'; this.flushOfflineQueue(); });
            window.addEventListener('offline', () => { this._state = 'offline'; });
        }
    }

    get state() { return this._state; }
    get pendingOffline() { return this.offlineQueue.length; }

    registerCommand(type: string, fn: CommandHandler, opts: CommandOpts = {}): void {
        this.commandHandlers.set(type, { fn, opts });
    }

    registerQuery(type: string, fn: QueryHandler, opts: QueryOpts = {}): void {
        this.queryHandlers.set(type, { fn, opts });
    }

    on(eventType: string, handler: (p: any) => void): () => void {
        return this.events.on(eventType, handler);
    }

    publish(event: DomainEvent | { type: string; p: any }): void {
        this.events.emit(event.type, event.p);
        this.rt?.postMessage({ type: event.type, p: event.p });
    }

    async dispatch<R = any>(command: Command): Promise<R> {
        const entry = this.commandHandlers.get(command.type);
        if (!entry) throw new Error(`No handler registered for command "${command.type}"`);
        const { fn, opts } = entry;

        if (opts.idempotent && command._idempotencyKey) {
            if (this.seenIdempotencyKeys.has(command._idempotencyKey)) {
                return Promise.resolve(undefined as any); // already executed, silently no-op
            }
            this.seenIdempotencyKeys.add(command._idempotencyKey);
        }

        if (this._state === 'offline' && opts.offline) {
            this.offlineQueue.push(command);
            if (opts.optimistic) this.applyOptimistic(command, opts);
            return Promise.resolve(undefined as any);
        }

        let prevState: any;
        if (opts.optimistic) {
            prevState = this.applyOptimistic(command, opts);
        }

        try {
            const result = await fn(command);
            this.undoStack.push({ command, prevState, rollback: opts.rollback });
            this.redoStack = [];
            this.publish({ type: `${command.type}.completed`, p: { command, result } });
            this.invalidateRelatedQueries(command.type);
            return result;
        } catch (err) {
            if (opts.rollback && prevState !== undefined) opts.rollback(command, prevState);
            this.publish({ type: `${command.type}.failed`, p: { command, error: err } });
            throw err;
        }
    }

    async query<R = any>(q: Query, opts?: QueryOpts): Promise<R> {
        const entry = this.queryHandlers.get(q.type);
        if (!entry) throw new Error(`No handler registered for query "${q.type}"`);
        const cfg = { ...entry.opts, ...opts };
        const key = queryKey(q);
        const cached = this.queryCache.get(key);
        const now = Date.now();

        if (cached?.inflight) return cached.inflight;

        const ttl = cfg.ttlMs ?? 0;
        const stale = cfg.staleMs ?? ttl;

        if (cached && now - cached.ts < ttl) {
            return cached.data; // fresh, serve directly
        }

        const fetchPromise = entry.fn(q).then((data) => {
            this.queryCache.set(key, { data, ts: Date.now() });
            return data;
        });

        if (cached && now - cached.ts < stale) {
            // stale-while-revalidate: kick off refresh in background, serve stale now
            this.queryCache.set(key, { ...cached, inflight: undefined });
            fetchPromise.catch(() => { }); // don't crash on background revalidation failure
            return cached.data;
        }

        this.queryCache.set(key, { data: cached?.data, ts: cached?.ts ?? 0, inflight: fetchPromise });
        const result = await fetchPromise;
        return result;
    }

    undo(): void {
        const entry = this.undoStack.pop();
        if (!entry) return;
        if (entry.rollback) entry.rollback(entry.command, entry.prevState);
        this.redoStack.push(entry);
    }

    redo(): void {
        const entry = this.redoStack.pop();
        if (!entry) return;
        this.dispatch(entry.command);
    }

    // -- internals --------------------------------------------------------

    private applyOptimistic(command: Command, opts: CommandOpts): any {
        if (!opts.optimistic) return undefined;
        const prevState = opts.optimistic(command);
        this.publish({ type: `${command.type}.optimistic`, p: { command, prevState } });
        return prevState;
    }

    private invalidateRelatedQueries(commandType: string): void {
        // naive convention: a command "renameDocument" invalidates queries starting "getDocument"
        const prefix = commandType.replace(/^(create|update|rename|delete|set)/i, 'get');
        for (const key of this.queryCache.keys()) {
            if (key.startsWith(prefix)) this.queryCache.delete(key);
        }
    }

    private async flushOfflineQueue(): Promise<void> {
        while (this.offlineQueue.length && this._state === 'online') {
            const command = this.offlineQueue.shift()!;
            try {
                await this.dispatch(command);
            } catch {
                this.offlineQueue.unshift(command); // put it back, stop draining on first failure
                break;
            }
        }
    }
}
// #endregion
