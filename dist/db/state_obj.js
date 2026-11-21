// ════════════════════════════════════════════════════════════════════════════
// [BYTE_ID]
// ════════════════════════════════════════════════════════════════════════════
class BYTE_ID {
    MAX_PENDING = 4096;
    sentTimestamps;
    pendingResolvers;
    cursor = 0;
    counter;
    epoch = 0;
    id() {
        const g = globalThis;
        const c = g._sauronIdCounter ?? (g._sauronIdCounter = new Uint32Array(1));
        if (++c[0] === 0)
            this.epoch++;
        return `${this.epoch}:${c[0]}`;
    }
    _sid() {
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
function newDict() {
    return Object.create(null);
}
export function getStateStoreMap(sl_reg = SLAVE_STATE_REG, ms_reg = MASTER_STATE_REG, globalKey = ROOT_STATE_REG) {
    const g = globalThis;
    let root = g[globalKey];
    if (!root) {
        root = newDict();
        g[globalKey] = root;
    }
    let master = root[ms_reg];
    if (!master) {
        master = newDict();
        root[ms_reg] = master;
    }
    let slave = master[sl_reg];
    if (!slave) {
        slave = newDict();
        master[sl_reg] = slave;
    }
    return slave;
}
function dictHas(dict, key) {
    return Object.prototype.hasOwnProperty.call(dict, key);
}
function dictDelete(dict, key) {
    if (!dictHas(dict, key))
        return false;
    delete dict[key];
    return true;
}
export const store = {
    get(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        if (dictHas(_state, key))
            return _state[key];
        if (dictHas(_persistKeys, key) && dictHas(_persistent, key)) {
            const value = _persistent[key];
            _state[key] = value;
            return value;
        }
        return undefined;
    },
    set(key, value, opts = { triggerRender: true }) {
        const { triggerRender = true, sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        const _listeners = getStateStoreMap(sl_reg ? `${sl_reg}_LISTENERS` : undefined, ms_reg, globalKey);
        const prev = dictHas(_state, key) ? _state[key] : undefined;
        const next = typeof value === 'function'
            ? value(prev)
            : value;
        if (Object.is(prev, next))
            return;
        _state[key] = next;
        if (dictHas(_persistKeys, key)) {
            _persistent[key] = next;
        }
        if (triggerRender) {
            _listeners[key]?.forEach(listener => listener(next));
        }
    },
    subscribe(key, listener, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _listeners = getStateStoreMap(sl_reg ? `${sl_reg}_LISTENERS` : undefined, ms_reg, globalKey);
        if (!dictHas(_listeners, key)) {
            _listeners[key] = new Set();
        }
        const listeners = _listeners[key];
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
            if (listeners.size === 0) {
                delete _listeners[key];
            }
        };
    },
    delete(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        const _listeners = getStateStoreMap(sl_reg ? `${sl_reg}_LISTENERS` : undefined, ms_reg, globalKey);
        const existed = dictDelete(_state, key);
        if (dictHas(_persistKeys, key)) {
            delete _persistKeys[key];
            delete _persistent[key];
        }
        _listeners[key]?.forEach(listener => listener(undefined));
        delete _listeners[key];
        return existed;
    },
    entries(opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        return Object.entries(_state);
    },
    persist(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        _persistKeys[key] = true;
    },
    unpersist(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        delete _persistKeys[key];
        delete _persistent[key];
    },
    has(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        return dictHas(_state, key)
            || (dictHas(_persistKeys, key) && dictHas(_persistent, key));
    },
    clear(opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const _listeners = getStateStoreMap(sl_reg ? `${sl_reg}_LISTENERS` : undefined, ms_reg, globalKey);
        for (const key of Object.keys(_state)) {
            delete _state[key];
        }
        for (const key of Object.keys(_listeners)) {
            delete _listeners[key];
        }
    },
    clearPersistent(opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _persistent = getStateStoreMap(sl_reg ? `${sl_reg}_PERSISTENT` : undefined, ms_reg, globalKey);
        const _persistKeys = getStateStoreMap(sl_reg ? `${sl_reg}_PERSIST_KEYS` : undefined, ms_reg, globalKey);
        for (const key of Object.keys(_persistent)) {
            delete _persistent[key];
        }
        for (const key of Object.keys(_persistKeys)) {
            delete _persistKeys[key];
        }
    },
};
export function getContextStateMetadata(sl_reg = SLAVE_STATE_REG, ms_reg = MASTER_STATE_REG, globalKey = ROOT_STATE_REG) {
    const g = globalThis;
    let root = g[globalKey];
    if (!root) {
        root = newDict();
        g[globalKey] = root;
    }
    let master = root[ms_reg];
    if (!master) {
        master = newDict();
        root[ms_reg] = master;
    }
    const metaKey = `${sl_reg}_META`;
    let meta = master[metaKey];
    if (!meta) {
        meta = {
            _batches: new Set(),
            _batchQueue: newDict(),
            _batchOpts: newDict(),
            _globalListeners: new Set(),
        };
        master[metaKey] = meta;
    }
    return meta;
}
export const state = {
    get(key, opts = {}) {
        return store.get(key, opts);
    },
    set(key, value, opts = {}) {
        const { sl_reg, ms_reg, globalKey, triggerRender = true } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);
        if (meta._batches.has(key)) {
            const prev = store.get(key, opts);
            const next = typeof value === 'function'
                ? value(prev)
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
            }
            catch (err) {
                console.error('[Sauron Global Listener Error]:', err);
            }
        }
    },
    delete(key, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);
        delete meta._batchQueue[key];
        delete meta._batchOpts[key];
        const deleted = store.delete(key, opts);
        if (deleted) {
            for (const listener of meta._globalListeners) {
                try {
                    listener(key, undefined);
                }
                catch (err) {
                    console.error('[Sauron Global Listener Error]:', err);
                }
            }
        }
        return deleted;
    },
    getByPrefix(prefix, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        const result = [];
        for (const key of Object.keys(_state)) {
            if (key.startsWith(prefix)) {
                result.push({ key, value: _state[key] });
            }
        }
        return result;
    },
    getAll(opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const _state = getStateStoreMap(sl_reg, ms_reg, globalKey);
        return Object.assign(newDict(), _state);
    },
    subscribe(key, listener, opts = {}) {
        return store.subscribe(key, listener, opts);
    },
    subscribeAll(listener, opts = {}) {
        const { sl_reg, ms_reg, globalKey } = opts;
        const meta = getContextStateMetadata(sl_reg, ms_reg, globalKey);
        meta._globalListeners.add(listener);
        return () => {
            meta._globalListeners.delete(listener);
        };
    },
    batch(key, fn, opts = {}) {
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
        }
        finally {
            meta._batches.delete(key);
        }
    },
    clear(opts = {}) {
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
export function publish(key, value, opts) {
    state.set(key, value, opts);
}
export function subscribe(key, listener, opts) {
    return state.subscribe(key, listener, opts);
}
export function getAll(opts) {
    return state.getAll(opts);
}
export function set(label, value, triggerRender = true, sl_reg, ms_reg, globalKey) {
    if (!label)
        return;
    state.set(label, value, {
        triggerRender,
        sl_reg,
        ms_reg,
        globalKey,
    });
}
export function get(label, sl_reg, ms_reg, globalKey) {
    if (!label)
        return undefined;
    return state.get(label, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}
export function subcribe(label, fn, sl_reg, ms_reg, globalKey) {
    if (!label || !fn)
        return () => { };
    return state.subscribe(label, fn, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}
export function del(label, sl_reg, ms_reg, globalKey) {
    if (!label)
        return false;
    return state.delete(label, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}
export function subAll(fn, sl_reg, ms_reg, globalKey) {
    if (!fn)
        return () => { };
    return state.subscribeAll(fn, {
        sl_reg,
        ms_reg,
        globalKey,
    });
}
