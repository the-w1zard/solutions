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
export declare class CQRS {
    private opts;
    private commandHandlers;
    private queryHandlers;
    private events;
    private queryCache;
    private seenIdempotencyKeys;
    private offlineQueue;
    private _state;
    private undoStack;
    private redoStack;
    private rt;
    constructor(opts?: {
        channelName?: string;
        crossTabSync?: boolean;
    });
    get state(): "online" | "offline";
    get pendingOffline(): number;
    registerCommand(type: string, fn: CommandHandler, opts?: CommandOpts): void;
    registerQuery(type: string, fn: QueryHandler, opts?: QueryOpts): void;
    on(eventType: string, handler: (p: any) => void): () => void;
    publish(event: DomainEvent | {
        type: string;
        p: any;
    }): void;
    dispatch<R = any>(command: Command): Promise<R>;
    query<R = any>(q: Query, opts?: QueryOpts): Promise<R>;
    undo(): void;
    redo(): void;
    private applyOptimistic;
    private invalidateRelatedQueries;
    private flushOfflineQueue;
}
