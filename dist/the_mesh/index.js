//                                                                                               [STORE]
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const { EventEmitter } = require("node:events");
export class Mesh extends EventEmitter {
    r = "THE_WIZARD_ROOT_REG";
    m = "SAURON_MASTER_REG";
    s = "SAURON_SLAVE_REG";
    k = "K_KEY";
    //                                                                                           [CONSTANTS]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    #waiters = new M2(); // { key, predicate, resolve, reject, timer }
    #data = new M2();
    #subs = new M2(); // key -> Set<fn>   (key-specific)
    #any_subs = new SET2(); // global watchers
    #frozen = false;
    #context = new M2();
    #meta_context = new M2();
    #global_notify_context = new WeakMap();
    #notify_context = new WeakMap();
    // #endregion
    //                                                                                               [STATE]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    _globalNotifyCache = new WeakMap();
    _notifyCache = new WeakMap();
    scheduleGlobalNotify(key, meta, opts) {
        let cache = this._globalNotifyCache.get(meta);
        if (!cache) {
            cache = new Map();
            this._globalNotifyCache.set(meta, cache);
        }
        let fn = cache.get(key);
        if (!fn) {
            fn = () => {
                cache.delete(key);
                const finalVal = this.store.get(key, opts);
                const waiters = meta._waiters.get(key);
                if (waiters) {
                    for (const resolveFn of waiters) {
                        try {
                            resolveFn(finalVal);
                        }
                        catch (err) {
                            console.error(`[Sauron Waiter Error]:`, err);
                        }
                    }
                    meta._waiters.delete(key);
                }
                for (const listener of meta._globalListeners) {
                    try {
                        listener(key, finalVal);
                    }
                    catch (err) {
                        console.error(`[Sauron Global Listener Error]:`, err);
                    }
                }
            };
            cache.set(key, fn);
        }
        this.onFlush(fn);
    }
    scheduleNotify(key, _listeners, _state) {
        let cache = this._notifyCache.get(_listeners);
        if (!cache) {
            cache = new Map();
            this._notifyCache.set(_listeners, cache);
        }
        let fn = cache.get(key);
        if (!fn) {
            fn = () => {
                cache.delete(key);
                const val = _state.get(key);
                _listeners.get(key)?.forEach((l) => l(val));
            };
            cache.set(key, fn);
        }
        this.onFlush(fn);
    }
    getMap(slave = this.s, master = this.m, rk = this.r) {
        let root = this.#context.get(rk); // (globalThis as any)[rk]  //  ; (globalThis as any)[rk] = root;
        if (!root) {
            root = new M2();
            this.#context.set(rk, root);
        }
        let masterMap = root.get(master);
        if (!masterMap) {
            masterMap = new M2();
            root.set(master, masterMap);
        }
        let slaveMap = masterMap.get(slave);
        if (!slaveMap) {
            slaveMap = new M2();
            masterMap.set(slave, slaveMap);
        }
        return slaveMap;
    }
    getMetadata(s = this.s, m = this.m, r = this.r) {
        let root = this.#meta_context.get(r); //  (globalThis as A)[r]; // STATE_CONTEXT === "sauron" ?  : null;
        if (!root) {
            root = new M2();
            this.#meta_context.set(r, root);
        }
        let masterMap = root.get(m);
        if (!masterMap) {
            masterMap = new M2();
            root.set(m, masterMap);
        }
        let metaMap = masterMap.get(s);
        if (!metaMap) {
            metaMap = {
                _batches: new Set(),
                _batchQueue: new Map(),
                _batchOpts: new Map(),
                _history: new Map(),
                _timeTravel: new Map(),
                _globalListeners: new Set(),
                _global_subscribers: new Map(),
                _waiters: new Map(),
                _sys: new Map(),
                _sealed: new Set(),
                _frozen: new Set(),
                _keyContracts: new Map(),
                _conflicts: new Map(),
                _conflictStrategies: new Map(),
                _causal: new Map(),
                _scopes: new Map(),
                _msgHandlers: new Map(),
                _lastWriteSource: new Map(),
                _mainMap: new Map(),
                _tupleCache: new Map(),
                _weakMap: new WeakMap(),
                _boundaries: new WeakMap(),
            };
            masterMap.set(s, metaMap);
        }
        return metaMap;
    }
    #hotPath = this.getMap(this.s, this.m, this.r);
    #persistent = this.getMap(`${this.s}_PERSISTENT`, this.m, this.r);
    #persistent_keys = this.getMap(`${this.s}_PERSIST_KEYS`, this.m, this.r);
    #listeners = this.getMap(`${this.s}_LISTENERS`, this.m, this.r);
    store = {
        get: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            // const { sl_reg, ms_reg, globalKey } = opts;
            // const _state = this.#hotPath;
            // const _persistent =  this.#persistent
            // const _persistKeys = this.#persistent_keys
            // recordDependency(key)
            if (this.#hotPath.has(key))
                return MaybePromise(this.#hotPath.get(key));
            if (this.#persistent_keys.has(key) && this.#persistent.has(key)) {
                const v = this.#persistent.get(key);
                this.#hotPath.set(key, v);
                return MaybePromise(v);
            }
            return undefined;
        },
        set: (key, value, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r, triggerRender: true, cap: 200 }) => {
            const { triggerRender = true, sl_reg, ms_reg, globalKey, cap } = opts;
            // const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
            // const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            // const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            // const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const prev = this.#hotPath.get(key);
            const next = typeof value === "function" ? value(prev) : value;
            if (Object.is(prev, next))
                return;
            // TIME TRAVEL
            /**if (!this.root.DRSTime._time_travel_reverting) {
             const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
             let hist = meta._history.get(key);
             if (!hist) {
                 hist = [];
                 meta._history.set(key, hist);
             }
             const lastActive = hist.findLastIndex((e: HistoryEntry) => !e.undone) ?? -1;
             if (lastActive < hist.length - 1) hist.length = lastActive + 1; // truncate redo tail
             hist.push({ k: (hist[hist.length - 1]?.k ?? 0) + 1, prev, next, ts: Date.now(), undone: false });
             const cap_val = cap ?? 200;
             while (hist.length > cap_val) hist.shift();
         } */
            this.#hotPath.set(key, next);
            if (this.#persistent_keys.has(key))
                this.#persistent.set(key, next);
            if (triggerRender)
                this.scheduleGlobalNotify(key, this.getMetadata(sl_reg, ms_reg, globalKey), opts);
            if (triggerRender)
                this.scheduleNotify(key, this.#listeners, this.#hotPath);
            return MaybePromise(next);
        },
        subscribe: (key, listener, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            // const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            if (!this.#listeners.has(key))
                this.#listeners.set(key, new Set());
            this.#listeners.get(key).add(listener);
            return () => {
                this.#listeners.get(key)?.delete(listener);
                if (this.#listeners.get(key)?.size === 0)
                    this.#listeners.delete(key);
            };
        },
        delete: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            // const  _state= this.getMap<A, A>(sl_reg, ms_reg, globalKey);
            //const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            // const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            //const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const existed = this.#hotPath.delete(key);
            if (this.#persistent_keys.has(key)) {
                this.#persistent_keys.delete(key);
                this.#persistent.delete(key);
            }
            this.#listeners.get(key)?.forEach((l) => l(undefined));
            this.#listeners.delete(key);
            return MaybePromise(existed);
        },
        entries: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //	const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
            return MaybePromise(Array.from(this.#hotPath.entries()));
        },
        persist: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            this.#persistent_keys.set(key, true);
        },
        unpersist: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            //const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            this.#persistent_keys.delete(key);
            this.#persistent.delete(key);
        },
        has: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
            //const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            //const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            return this.#hotPath.has(key) || (this.#persistent_keys.has(key) && this.#persistent.has(key));
        },
        clear: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
            //const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            this.#hotPath.clear();
            this.#listeners.clear();
        },
        clearPersistent: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            //const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            //const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            this.#persistent.clear();
            this.#persistent_keys.clear();
        },
        _emit: (key, sl_reg = this.s, ms_reg = this.m, globalKey = this.r) => {
            const opts = { sl_reg, ms_reg, globalKey };
            //const  _state = this.getMap(sl_reg, ms_reg, globalKey);
            //const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            this.scheduleNotify(key, this.#listeners, this.#hotPath);
            this.scheduleGlobalNotify(key, meta, opts);
        },
    };
    state = {
        get: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            return MaybePromise(this.store.get(key, opts));
        },
        set: (key, value, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey, triggerRender = true } = opts;
            this.store.set(key, value, { triggerRender, sl_reg, ms_reg, globalKey });
            return MaybePromise(value);
        },
        delete: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            const deleted = this.store.delete(key, opts);
            if (deleted) {
                for (const listener of meta._globalListeners) {
                    try {
                        listener(key, undefined);
                    }
                    catch (err) {
                        console.error(`[Sauron Global Listener Error]:`, err);
                    }
                }
            }
            return deleted;
        },
        getByPrefix: (prefix, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            return this.store
                .entries(opts)
                .filter(([key]) => typeof key === "string" && key.startsWith(prefix))
                .map(([key, value]) => ({ key: key, value }));
        },
        getAll: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const result = {};
            for (const [key, value] of this.store.entries(opts)) {
                result[key] = value;
            }
            return result;
        },
        subscribe: (key, listener, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            return this.store.subscribe(key, listener, opts);
        },
        subscribeAll: (listener, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            meta._globalListeners.add(listener);
            return () => {
                meta._globalListeners.delete(listener);
            };
        },
        clear: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            this.store.clear(opts);
            meta._waiters.clear();
            meta._globalListeners.clear();
        },
        waitFor: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            // If it already exists, resolve immediately
            const existing = this.state.get(key, opts);
            if (existing !== undefined)
                return Promise.resolve(existing);
            return new Promise((resolve) => {
                if (!meta._waiters.has(key))
                    meta._waiters.set(key, new Set());
                meta._waiters.get(key).add(resolve);
            });
        },
    };
    onFlush(cb) {
        this.dirty.add(cb);
        this.scheduleDrain();
    }
    scheduleDrain() {
        if (this._flushScheduled)
            return;
        this._flushScheduled = true;
        queueMicrotask(this.drain);
    }
    drain() {
        this._flushScheduled = false;
        if (this.dirty.size === 0)
            return;
        // An explicit openBatch() scope is still open (deliberately spanning an await) —
        // don't drop the pending callbacks, just wait for closeBatch() to let them through.
        if (this.openScopes.size > 0) {
            this.scheduleDrain();
            return;
        }
        const callbacks = this.dirty;
        this.dirty = new Set();
        for (const cb of callbacks)
            cb();
    }
    // #endregion
    //                                                                                                 [SET]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    set(key, value) {
        if (this.#frozen)
            throw new Error("Store is frozen");
        const prev = this.#data.swap(key, value); // returns previous, writes new
        this.#notify(key, value, prev);
        return this;
    }
    setLazy(key, make) {
        const prev = this.#data.g(key);
        const value = make();
        this.#data.s(key, value);
        this.#notify(key, value, prev);
        return this;
    }
    delete(key) {
        if (!this.#data.h(key))
            return false;
        const prev = this.#data.take(key);
        this.#notify(key, undefined, prev);
        return true;
    }
    clear() {
        for (const key of this.#data.toKeys())
            this.#notify(key, undefined, this.#data.g(key));
        this.#data.clear();
    }
    subscribe(keyOrFn, maybeFn, opts = {}) {
        // global watcher
        if (typeof keyOrFn === "function") {
            const fn = keyOrFn;
            this.#any_subs.add(fn);
            return () => {
                this.#any_subs.delete(fn);
            };
        }
        const key = keyOrFn;
        // iterator form: no maybeFn, or second arg is an options object
        if (maybeFn === undefined || (typeof maybeFn === "object" && maybeFn !== null)) {
            const iteratorOpts = (typeof maybeFn === "object" && maybeFn) || opts;
            return this.#asIterator(key, iteratorOpts);
        }
        // callback form
        const fn = maybeFn;
        let set = this.#subs.getOrM(() => new SET2(), key);
        set.add(fn);
        if (opts.immediate && this.#data.has(key)) {
            queueMicrotask(() => fn(this.#data.get(key), undefined, key));
        }
        // unsubscribe
        return () => {
            const set = this.#subs.g(key);
            if (!set)
                return;
            set.delete(fn);
            if (set.size === 0)
                this.#subs.d(key);
        };
    }
    unsubscribeAll(fns) {
        for (const set of this.#subs.values())
            set.deleteAll(fns);
        this.#any_subs.deleteAll(fns);
    }
    subscribersOf(keys) {
        let out = new SET2();
        for (const key of keys) {
            const set = this.#subs.g(key);
            if (set)
                out = out.union(set);
        }
        return out;
    }
    async *#asIterator(key, { immediate = false } = {}) {
        // buffer events so a slow consumer doesn't lose them
        const queue = [];
        let resolve;
        let done = false;
        const push = (v) => {
            queue.push(v);
            if (resolve) {
                const r = resolve;
                resolve = null;
                r();
            }
        };
        const unsub = this.subscribe(key, (v, prev) => push({ value: v, prev }));
        const stop = this.subscribe((k, v, prev) => {
            if (k === key)
                push({ value: v, prev });
        });
        try {
            if (immediate && this.has(key))
                yield this.get(key);
            while (!done) {
                if (queue.length === 0)
                    await new Promise((r) => (resolve = r));
                while (queue.length)
                    yield queue.shift().value;
            }
        }
        finally {
            unsub();
            stop();
        }
    }
    #notify(key, value, prev) {
        const waiting = this.#waiters.get(key);
        if (waiting) {
            for (const w of waiting) {
                if (!w.predicate(value, prev))
                    continue;
                w.cleanup();
                w.resolve(value);
            }
        }
    }
    get(key, fallback) {
        return this.#data.has(key) ? this.#data.get(key) : fallback;
    }
    getAll() {
        return this.#data.clone();
    }
    has(key) {
        return this.#data.has(key);
    }
    freeze() {
        this.#frozen = true;
    }
    // #endregion
    //                                                                                                [WAIT]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    /*  ====================================================================================================
     wait(key, opts?) -> Promise<value>

     opts.predicate(value, prev) -> boolean   // keep waiting until true

     opts.timeout   -> ms, rejects on timeout

     opts.immediate -> resolve now if predicate passes for current value

     opts.signal    -> AbortSignal
    ============================================================= ⇦✦──⇦✦──✦──✦──← 'pew pew' 🧙 [STORE] */
    wait(key, { predicate = () => true, timeout, immediate = true, signal } = {}) {
        // Fast path: value already satisfies
        if (immediate && this.#data.has(key) && predicate(this.#data.get(key), undefined)) {
            return Promise.resolve(this.#data.get(key));
        }
        return new Promise((resolve, reject) => {
            const waiter = { key, predicate, resolve, reject, timer: null };
            const cleanup = () => {
                this.#waiters.delete(waiter);
                if (waiter.timer)
                    clearTimeout(waiter.timer);
                if (signal)
                    signal.removeEventListener("abort", onAbort);
            };
            const onAbort = () => {
                cleanup();
                const err = new Error("wait aborted");
                err.name = "AbortError";
                reject(err);
            };
            if (timeout) {
                waiter.timer = setTimeout(() => {
                    cleanup();
                    const err = new Error(`wait('${key}') timed out after ${timeout}ms`);
                    err.name = "TimeoutError";
                    reject(err);
                }, timeout).unref();
            }
            if (signal) {
                if (signal.aborted)
                    return onAbort();
                signal.addEventListener("abort", onAbort, { once: true });
            }
            waiter.cleanup = cleanup;
            this.#waiters.getOrM(() => new SET2(), key).add(waiter);
        });
    } // Convenience: wait for a *change* (ignore current value)
    waitChange(key, opts = {}) {
        return this.wait(key, { ...opts, immediate: false });
    }
    // Convenience: wait until predicate holds for the current or next value
    waitFor(key, predicate, opts = {}) {
        return this.wait(key, { ...opts, predicate });
    }
    // #endregion
    //                                                                                              [ATOMIC]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    setIfAbsent(key, value) {
        if (!this.#data.setIfAbsent(key, value))
            return false;
        this.#notify(key, value, undefined);
        return true;
    }
    setIfPresent(key, value) {
        const prev = this.#data.g(key);
        if (!this.#data.setIfPresent(key, value))
            return false;
        this.#notify(key, value, prev);
        return true;
    }
    replace(key, value) {
        return this.setIfPresent(key, value);
    }
    update(key, fn, initial) {
        const had = this.#data.h(key);
        const prev = had ? this.#data.g(key) : undefined;
        const next = this.#data.update(key, fn, initial);
        this.#notify(key, next, prev);
        return next;
    }
    inc(key, by = 1) {
        const prev = this.#data.g(key);
        const next = this.#data.inc(key, by);
        this.#notify(key, next, prev);
        return next;
    }
    touch(key) {
        // register interest without overwriting — useful for the "subscribed but not yet written" case
        if (!this.#data.setIfAbsent(key, undefined))
            return false;
        this.#notify(key, undefined, undefined);
        return true;
    }
    // #endregion
    //                                                                                               [OTHER]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    toJSON() {
        return this.#data.toObject();
    }
    entries() {
        return this.#data.toArray();
    }
    keys() {
        return this.#data.toKeys();
    }
    values() {
        return this.#data.toValues();
    }
    find(pred) {
        return this.#data.find(pred);
    }
    findKey(pred) {
        return this.#data.findKey(pred);
    }
    group(fn) {
        return this.#data.group(fn);
    }
    pick(keys) {
        return this.#data.pick(keys);
    }
    omit(keys) {
        return this.#data.omit(keys);
    }
    snapshot() {
        return this.#data.clone();
    }
    equals(other) {
        return this.#data.equals(other);
    }
    snapshotSubs() {
        return this.#subs.mapValues((set) => set.clone());
    }
}
