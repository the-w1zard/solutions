// ════════════════════════════════════════════════════════════════════════════
// [BYTE_ID]
// ════════════════════════════════════════════════════════════════════════════
class BYTE_ID {
    public MAX_PENDING = 4096;
    public sentTimestamps: Float64Array;
    public pendingResolvers: Array<any>;
    public cursor = 0;

    private readonly counter: Uint32Array;
    private epoch = 0;

    public id(): string {
        const g = globalThis as any;

        const c = g._sauronIdCounter ?? (g._sauronIdCounter = new Uint32Array(1));

        if (++c[0] === 0) this.epoch++;

        return `${this.epoch}:${c[0]}`;
    }

    public _sid(): string {
        return this.id();
    }

    constructor() {
        this.counter = new Uint32Array(1);
        this.sentTimestamps = new Float64Array(this.MAX_PENDING);
        this.pendingResolvers = new Array(this.MAX_PENDING);
    }
}

export const _bid = new BYTE_ID();


// ════════════════════════════════════════════════════════════════════════════
// [STORE]
// ════════════════════════════════════════════════════════════════════════════
export const ROOT_STATE_REG = '__ROOT_STATE_REG__';
export const MASTER_STATE_REG = '__MASTER_STATE_REG__';
export const SLAVE_STATE_REG = '__SLAVE_STATE_REG__';


export interface ScopeOptions {
    sl_reg?: any;
    ms_reg?: any;
    globalKey?: any;
}


type ObjDict<T = any> = Record<string | symbol, T>;


function newDict<T = any>(): ObjDict<T> {
    return Object.create(null) as ObjDict<T>;
}


export function getStateStoreMap<K extends string | symbol, V>(
    sl_reg: any = SLAVE_STATE_REG,
    ms_reg: any = MASTER_STATE_REG,
    globalKey: any = ROOT_STATE_REG,
): ObjDict<V> {
    const g = globalThis as any;

    let root: ObjDict<ObjDict<ObjDict<any>>> = g[globalKey];

    if (!root) {
        root = newDict<ObjDict<ObjDict<any>>>();
        g[globalKey] = root;
    }

    let master = root[ms_reg];

    if (!master) {
        master = newDict<ObjDict<any>>();
        root[ms_reg] = master;
    }

    let slave = master[sl_reg];

    if (!slave) {
        slave = newDict<V>();
        master[sl_reg] = slave;
    }

    return slave;
}


function dictHas<T>(dict: ObjDict<T>, key: string | symbol): boolean {
    return Object.prototype.hasOwnProperty.call(dict, key);
}


function dictDelete<T>(dict: ObjDict<T>, key: string | symbol): boolean {
    if (!dictHas(dict, key)) return false;

    delete dict[key];
    return true;
}


export const store = {
    get<T>(key: string | symbol, opts: ScopeOptions = {}): T | undefined {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, any>(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );

        if (dictHas(_state, key)) return _state[key] as T;

        if (dictHas(_persistKeys, key) && dictHas(_persistent, key)) {
            const value = _persistent[key] as T;

            _state[key] = value;
            return value;
        }

        return undefined;
    },

    set<T>(
        key: string | symbol,
        value: T | ((prev: T | undefined) => T),
        opts: { triggerRender?: boolean } & ScopeOptions = { triggerRender: true },
    ): void {
        const { triggerRender = true, sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, any>(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );
        const _listeners = getStateStoreMap<string | symbol, Set<(value: any) => void>>(
            sl_reg ? `${sl_reg}_LISTENERS` : undefined,
            ms_reg,
            globalKey,
        );

        const prev = dictHas(_state, key) ? _state[key] as T : undefined;
        const next = typeof value === 'function'
            ? (value as (prev: T | undefined) => T)(prev)
            : value;

        if (Object.is(prev, next)) return;

        _state[key] = next;

        if (dictHas(_persistKeys, key)) {
            _persistent[key] = next;
        }

        if (triggerRender) {
            _listeners[key]?.forEach(listener => listener(next));
        }
    },

    subscribe<T>(
        key: string | symbol,
        listener: (value: T) => void,
        opts: ScopeOptions = {},
    ): () => void {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _listeners = getStateStoreMap<string | symbol, Set<(value: any) => void>>(
            sl_reg ? `${sl_reg}_LISTENERS` : undefined,
            ms_reg,
            globalKey,
        );

        if (!dictHas(_listeners, key)) {
            _listeners[key] = new Set();
        }

        const listeners = _listeners[key]!;
        listeners.add(listener as any);

        return () => {
            listeners.delete(listener as any);

            if (listeners.size === 0) {
                delete _listeners[key];
            }
        };
    },

    delete(key: string | symbol, opts: ScopeOptions = {}): boolean {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, any>(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );
        const _listeners = getStateStoreMap<string | symbol, Set<(value: any) => void>>(
            sl_reg ? `${sl_reg}_LISTENERS` : undefined,
            ms_reg,
            globalKey,
        );

        const existed = dictDelete(_state, key);

        if (dictHas(_persistKeys, key)) {
            delete _persistKeys[key];
            delete _persistent[key];
        }

        _listeners[key]?.forEach(listener => listener(undefined));
        delete _listeners[key];

        return existed;
    },

    entries<T = any>(opts: ScopeOptions = {}): [string | symbol, T][] {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, T>(sl_reg, ms_reg, globalKey);

        return Object.entries(_state) as [string | symbol, T][];
    },

    persist(key: string | symbol, opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );

        _persistKeys[key] = true;
    },

    unpersist(key: string | symbol, opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );

        delete _persistKeys[key];
        delete _persistent[key];
    },

    has(key: string | symbol, opts: ScopeOptions = {}): boolean {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, any>(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );

        return dictHas(_state, key)
            || (dictHas(_persistKeys, key) && dictHas(_persistent, key));
    },

    clear(opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, any>(sl_reg, ms_reg, globalKey);
        const _listeners = getStateStoreMap<string | symbol, Set<(value: any) => void>>(
            sl_reg ? `${sl_reg}_LISTENERS` : undefined,
            ms_reg,
            globalKey,
        );

        for (const key of Object.keys(_state)) {
            delete _state[key];
        }

        for (const key of Object.keys(_listeners)) {
            delete _listeners[key];
        }
    },

    clearPersistent(opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _persistent = getStateStoreMap<string | symbol, any>(
            sl_reg ? `${sl_reg}_PERSISTENT` : undefined,
            ms_reg,
            globalKey,
        );
        const _persistKeys = getStateStoreMap<string | symbol, boolean>(
            sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined,
            ms_reg,
            globalKey,
        );

        for (const key of Object.keys(_persistent)) {
            delete _persistent[key];
        }

        for (const key of Object.keys(_persistKeys)) {
            delete _persistKeys[key];
        }
    },
};


// ════════════════════════════════════════════════════════════════════════════
// [STATE]
// ════════════════════════════════════════════════════════════════════════════
export interface SauronState {
    get<T>(key: string | symbol, opts?: ScopeOptions): T | undefined;
    set<T>(
        key: string | symbol,
        value: T | ((prev: T | undefined) => T),
        opts?: { triggerRender?: boolean } & ScopeOptions,
    ): void;
    delete(key: string | symbol, opts?: ScopeOptions): boolean;
    getByPrefix<T>(prefix: string, opts?: ScopeOptions): { key: string; value: T }[];
    getAll<T = any>(opts?: ScopeOptions): Record<string | symbol, T>;
    subscribe<T>(
        key: string | symbol,
        listener: (value: T) => void,
        opts?: ScopeOptions,
    ): () => void;
    subscribeAll(
        listener: (key: string | symbol, value: any) => void,
        opts?: ScopeOptions,
    ): () => void;
    batch(key: string | symbol, fn: () => void, opts?: ScopeOptions): void;
    clear(opts?: ScopeOptions): void;
}


interface ContextStateMetadata {
    _batches: Set<string | symbol>;
    _batchQueue: ObjDict<any>;
    _batchOpts: ObjDict<{ triggerRender?: boolean }>;
    _globalListeners: Set<(key: string | symbol, value: any) => void>;
}


export function getContextStateMetadata(
    sl_reg: any = SLAVE_STATE_REG,
    ms_reg: any = MASTER_STATE_REG,
    globalKey: any = ROOT_STATE_REG,
): ContextStateMetadata {
    const g = globalThis as any;

    let root: ObjDict<ObjDict<any>> = g[globalKey];

    if (!root) {
        root = newDict<ObjDict<any>>();
        g[globalKey] = root;
    }

    let master = root[ms_reg];

    if (!master) {
        master = newDict<any>();
        root[ms_reg] = master;
    }

    const metaKey = `${sl_reg}_META`;

    let meta: ContextStateMetadata = master[metaKey];

    if (!meta) {
        meta = {
            _batches: new Set<string | symbol>(),
            _batchQueue: newDict<any>(),
            _batchOpts: newDict<{ triggerRender?: boolean }>(),
            _globalListeners: new Set(),
        };

        master[metaKey] = meta;
    }

    return meta;
}


export const state: SauronState = {
    get<T>(key: string | symbol, opts: ScopeOptions = {}): T | undefined {
        return store.get<T>(key, opts);
    },

    set<T>(
        key: string | symbol,
        value: T | ((prev: T | undefined) => T),
        opts: { triggerRender?: boolean } & ScopeOptions = {},
    ): void {
        const { sl_reg, ms_reg, globalKey, triggerRender = true } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);

        if (meta._batches.has(key)) {
            const prev = store.get<T>(key, opts);

            const next = typeof value === 'function'
                ? (value as (prev: T | undefined) => T)(prev)
                : value;

            meta._batchQueue[key] = next;
            meta._batchOpts[key] = { triggerRender };

            return;
        }

        store.set(key, value, {
            triggerRender,
            sl_reg,
            ms_reg,
            globalKey,
        });

        const finalValue = store.get(key, opts);

        for (const listener of meta._globalListeners) {
            try {
                listener(key, finalValue);
            } catch (err) {
                console.error('[Sauron Global Listener Error]:', err);
            }
        }
    },

    delete(key: string | symbol, opts: ScopeOptions = {}): boolean {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);

        delete meta._batchQueue[key];
        delete meta._batchOpts[key];

        const deleted = store.delete(key, opts);

        if (deleted) {
            for (const listener of meta._globalListeners) {
                try {
                    listener(key, undefined);
                } catch (err) {
                    console.error('[Sauron Global Listener Error]:', err);
                }
            }
        }

        return deleted;
    },

    getByPrefix<T>(prefix: string, opts: ScopeOptions = {}): { key: string; value: T }[] {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, T>(sl_reg, ms_reg, globalKey);
        const result: { key: string; value: T }[] = [];

        for (const key of Object.keys(_state)) {
            if (key.startsWith(prefix)) {
                result.push({ key, value: _state[key] as T });
            }
        }

        return result;
    },

    getAll<T = any>(opts: ScopeOptions = {}): Record<string | symbol, T> {
        const { sl_reg, ms_reg, globalKey } = opts;

        const _state = getStateStoreMap<string | symbol, T>(sl_reg, ms_reg, globalKey);

        return Object.assign(newDict<T>(), _state);
    },

    subscribe<T>(
        key: string | symbol,
        listener: (value: T) => void,
        opts: ScopeOptions = {},
    ): () => void {
        return store.subscribe<T>(key, listener, opts);
    },

    subscribeAll(
        listener: (key: string | symbol, value: any) => void,
        opts: ScopeOptions = {},
    ): () => void {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);

        meta._globalListeners.add(listener);

        return () => {
            meta._globalListeners.delete(listener);
        };
    },

    batch(key: string | symbol, fn: () => void, opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);

        meta._batches.add(key);

        try {
            fn();

            if (dictHas(meta._batchQueue, key)) {
                const value = meta._batchQueue[key];
                const batchOpts = meta._batchOpts[key] ?? {};

                delete meta._batchQueue[key];
                delete meta._batchOpts[key];

                store.set(key, value, {
                    ...batchOpts,
                    sl_reg,
                    ms_reg,
                    globalKey,
                });
            }
        } finally {
            meta._batches.delete(key);
        }
    },

    clear(opts: ScopeOptions = {}): void {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);

        store.clear(opts);

        meta._batches.clear();

        for (const key of Object.keys(meta._batchQueue)) {
            delete meta._batchQueue[key];
        }

        for (const key of Object.keys(meta._batchOpts)) {
            delete meta._batchOpts[key];
        }

        meta._globalListeners.clear();
    },
};

export default state;


export function publish(
    key: string | symbol,
    value: any,
    opts?: ScopeOptions,
): void {
    state.set(key, value, opts);
}


export function subscribe<T = any>(
    key: string | symbol,
    listener: (value: T) => void,
    opts?: ScopeOptions,
): () => void {
    return state.subscribe<T>(key, listener, opts);
}


export function getAll<T = any>(opts?: ScopeOptions): Record<string | symbol, T> {
    return state.getAll<T>(opts);
}


export function set<T>(
    label: string,
    value: T,
    triggerRender = true,
    sl_reg?: any,
    ms_reg?: any,
    globalKey?: any,
): void {
    if (!label) return;

    state.set(label, value, {
        triggerRender,
        sl_reg,
        ms_reg,
        globalKey,
    });
}


export function get<T>(
    label: string,
    sl_reg?: any,
    ms_reg?: any,
    globalKey?: any,
): T | undefined {
    if (!label) return undefined;

    return state.get<T>(label, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}


export function subcribe<T>(
    label: string,
    fn: (value: T) => void,
    sl_reg?: any,
    ms_reg?: any,
    globalKey?: any,
): () => void {
    if (!label || !fn) return () => {};

    return state.subscribe<T>(label, fn, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}


export function del(
    label: string,
    sl_reg?: any,
    ms_reg?: any,
    globalKey?: any,
): boolean {
    if (!label) return false;

    return state.delete(label, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}


export function subAll(
    fn: (key: string | symbol, value: any) => void,
    sl_reg?: any,
    ms_reg?: any,
    globalKey?: any,
): () => void {
    if (!fn) return () => {};

    return state.subscribeAll(fn, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}
