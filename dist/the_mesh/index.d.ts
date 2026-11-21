declare const EventEmitter: any;
export declare class Mesh extends EventEmitter {
    #private;
    r: string;
    m: string;
    s: string;
    k: S;
    _globalNotifyCache: WeakMap<any, Map<any, () => void>>;
    _notifyCache: WeakMap<Map<any, Set<(value: A) => void>>, Map<any, () => void>>;
    scheduleGlobalNotify(key: string | symbol, meta: A, opts: ScopeOptions): void;
    scheduleNotify(key: A, _listeners: Map<A, Set<(value: A) => void>>, _state: Map<A, A>): void;
    getMap<K, V>(slave?: A, master?: A, rk?: A): M2<K, V>;
    getMetadata(s?: string, m?: string, r?: string): any;
    store: {
        get: <T = any>(key: A, opts?: ScopeOptions) => T | undefined;
        set: <T = any>(key: A, value: T | ((prev: T | undefined) => T), opts?: {
            triggerRender?: boolean;
            cap?: number;
        } & ScopeOptions) => any;
        subscribe: <T = any>(key: A, listener: (value: T) => void, opts?: ScopeOptions) => (() => void);
        delete: (key: A, opts?: ScopeOptions) => boolean;
        entries: <T = any>(opts?: ScopeOptions) => [A, T][];
        persist: (key: A, opts?: ScopeOptions) => void;
        unpersist: (key: A, opts?: ScopeOptions) => void;
        has: (key: A, opts?: ScopeOptions) => boolean;
        clear: (opts?: ScopeOptions) => void;
        clearPersistent: (opts?: ScopeOptions) => void;
        _emit: (key: string | symbol, sl_reg?: string, ms_reg?: string, globalKey?: string) => void;
    };
    state: {
        get: <T = any>(key: string | symbol, opts?: ScopeOptions) => T | undefined;
        set: <T = any>(key: string | symbol, value: T | ((prev: T | undefined) => T), opts?: {
            triggerRender?: boolean;
        } & ScopeOptions) => void;
        delete: (key: string | symbol, opts?: ScopeOptions) => boolean;
        getByPrefix: <T = any>(prefix: string, opts?: ScopeOptions) => {
            key: string;
            value: T;
        }[];
        getAll: <T = any>(opts?: ScopeOptions) => Record<string | symbol, T>;
        subscribe: <T = any>(key: string | symbol, listener: (value: T) => void, opts?: ScopeOptions) => (() => void);
        subscribeAll: (listener: (key: string | symbol, value: A) => void, opts?: ScopeOptions) => (() => void);
        clear: (opts?: ScopeOptions) => void;
        waitFor: <T = any>(key: string | symbol, opts?: ScopeOptions) => Promise<T>;
    };
    onFlush(cb: FlushCallback): void;
    scheduleDrain(): void;
    drain(): void;
    set(key: A, value: A): this;
    setLazy(key: A, make: () => A): this;
    delete(key: A): boolean;
    clear(): void;
    subscribe(fn: (value: A, prev: A, key: S) => V): () => V;
    subscribe(key: S, fn: (value: A, prev: A, key: S) => V, opts?: {
        immediate?: B;
    }): () => V;
    subscribe(key: S, opts?: {
        immediate?: B;
    }): AsyncGenerator<A, V, U>;
    unsubscribeAll(fns: Iterable<FN>): void;
    subscribersOf(keys: S[]): A;
    get<T = A>(key: S): T | UD;
    get<T = A>(key: S, fallback: T): T;
    getAll(): A;
    has(key: A): any;
    freeze(): void;
    wait(key: A, { predicate, timeout, immediate, signal }?: A): Promise<any>;
    waitChange(key: A, opts?: {}): Promise<any>;
    waitFor(key: A, predicate: A, opts?: {}): Promise<any>;
    setIfAbsent(key: A, value: U): boolean;
    setIfPresent(key: A, value: U): boolean;
    replace(key: A, value: U): boolean;
    update(key: A, fn: (old: A, has: B) => A, initial: U): any;
    inc(key: A, by?: number): any;
    touch(key: A): boolean;
    toJSON(): any;
    entries(): any;
    keys(): any;
    values(): any;
    find(pred: A): any;
    findKey(pred: A): any;
    group(fn: A): any;
    pick(keys: A): any;
    omit(keys: A): any;
    snapshot(): A;
    equals(other: A): any;
    snapshotSubs(): any;
}
export {};
