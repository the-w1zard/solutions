export type Teardown = void | null | (() => void) | {
    unsubscribe(): void;
} | {
    [Symbol.dispose](): void;
} | Teardown[];
export declare function runTeardown(t: Teardown): void;
export declare function reportError(e: unknown): void;
export declare class INDEXED_DB {
    readonly dbName: S;
    readonly storeName: S;
    private _version;
    private _migrations;
    private _nodeId;
    private _hlc;
    private _onFlush;
    private _onError;
    private _db;
    private _opening;
    private memory;
    private inflight;
    private ttlMs;
    private memoryTimer?;
    private pending;
    private flushScheduled;
    private _closed;
    private subscribers;
    private _channel?;
    private _localChange;
    constructor(opts?: IndexedDbOptions);
    defineMigration(version: N, fn: Migration): this;
    private open;
    private scheduleFlush;
    private flush;
    get<T = A>(key: S, chain?: CHAIN): any;
    getOrThrow<T = A>(key: S, chain?: CHAIN): any;
    has(key: S, chain?: CHAIN): any;
    set<T = A>(key: S, value: T, chain?: CHAIN): any;
    setMany(entries: Record<S, A>): P<V>;
    update<T = A>(key: S, updater: (prev: T | UD) => T, chain?: CHAIN): Promise<any>;
    delete(key: S, chain?: CHAIN): any;
    deleteMany(keys: S[]): P<V>;
    clear(chain?: CHAIN): Promise<any>;
    keys(chain?: CHAIN): Promise<any>;
    private _enqueueGet;
    private _enqueuePut;
    private _enqueueDel;
    private _enqueueHas;
    private _enqueueKeys;
    private _enqueueClear;
    private _enqueueCursor;
    subscribe<T = A>(key: S, cb: Subscriber<T>, chain?: CHAIN): Teardown;
    /** Selector-based subscription — only fires when the selected slice changes. */
    select<T = A, S = A>(key: A, selector: Selector<T | UD, S>, cb: Subscriber<S>, chain?: CHAIN): Teardown;
    private _emit;
    waitFor<T = A>(key: S, opts?: {
        timeoutMs?: N;
    }): P<T>;
    entries(range?: IDBKeyRange): AsyncIterableIterator<[string, A]>;
    private _broadcastPut;
    private _broadcastDel;
    private _broadcastClear;
    private _onRemote;
    merge<T = A>(key: S, incoming: T, policy: ConflictResolver<T>): P<V>;
    touchMemory(): V;
    /** Force memory to rehydrate from IDB on next read. */
    invalidateMemory(key?: S): V;
    close(): P<V>;
    isOpen(): B;
    info(): P<{
        isOpen: B;
        dbName: S;
        storeName: S;
        version: N;
        count: N;
    }>;
}
export declare const IDB_KV: INDEXED_DB;
