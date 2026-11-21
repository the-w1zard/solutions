// #endregion
//                                                                                               [USAGE]
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/*  ====================================================================================================
     const store = require('./store');

     const unsub = store.subscribe('user', (value, prev, key) => {
      console.log(`${key} changed:`, prev, '->', value);
     });

     store.set('user', 'Alice');  // logs
     store.set('other', 1);       // ignored
     unsub();                     // stop listening

     const unsub = store.subscribe((value, prev, key) => {
      console.log('any change:', key);
    });
  
  
    for await (const value of store.subscribe('token', { immediate: true })) {
      await refreshWith(value);
    if (value === 'stop') break;   // breaking
      ============================================================= ⇦✦──⇦✦──✦──✦──← 'pew pew' 🧙 [STORE] */
// #endregion
//                                                                                               [STORE]
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const { EventEmitter } = require("node:events");
class ZeroStore extends EventEmitter {
    #waiters = new M2(); // { key, predicate, resolve, reject, timer }
    #data = new M2();
    #subs = new M2(); // key -> Set<fn>   (key-specific)
    #anySubs = new SET2(); // global watchers
    #frozen = false;
    #context = new M2();
    r = "_root_k_";
    m = "_master_k_";
    s = "_slave_k_";
    //                                                                                                 [MAP]
    // #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    getMap(slave = this.s, master = this.m, rk = this.r) {
        let root = this.#context; // (globalThis as any)[rk]  //  ; (globalThis as any)[rk] = root;
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
        let root = globalThis[r]; // STATE_CONTEXT === "sauron" ?  : null;
        if (!root) {
            root = new Map();
            globalThis[r] = root;
        }
        let masterMap = root.get(m);
        if (!masterMap) {
            masterMap = new Map();
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
    store = {
        get: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            // recordDependency(key)
            if (_state.has(key))
                return MaybePromise(_state.get(key));
            if (_persistKeys.has(key) && _persistent.has(key)) {
                const v = _persistent.get(key);
                _state.set(key, v);
                return MaybePromise(v);
            }
            return undefined;
        },
        set: (key, value, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r, triggerRender: true, cap: 200 }) => {
            const { triggerRender = true, sl_reg, ms_reg, globalKey, cap } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            const _listeners = this.getMap(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const prev = _state.get(key);
            const next = typeof value === "function" ? value(prev) : value;
            if (Object.is(prev, next))
                return;
            // TIME TRAVEL
            if (!this.root.TIME_TRAVEL._time_travel_reverting) {
                const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
                let hist = meta._history.get(key);
                if (!hist) {
                    hist = [];
                    meta._history.set(key, hist);
                }
                const lastActive = hist.findLastIndex((e) => !e.undone) ?? -1;
                if (lastActive < hist.length - 1)
                    hist.length = lastActive + 1; // truncate redo tail
                hist.push({ k: (hist[hist.length - 1]?.k ?? 0) + 1, prev, next, ts: Date.now(), undone: false });
                const cap_val = cap ?? 200;
                while (hist.length > cap_val)
                    hist.shift();
            }
            _state.set(key, next);
            if (_persistKeys.has(key))
                _persistent.set(key, next);
            if (triggerRender)
                this.scheduleGlobalNotify(key, this.getMetadata(sl_reg, ms_reg, globalKey), opts);
            if (triggerRender)
                this.scheduleNotify(key, _listeners, _state);
            return MaybePromise(next);
        },
        subscribe: (key, listener, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _listeners = this.getMap(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            if (!_listeners.has(key))
                _listeners.set(key, new Set());
            _listeners.get(key).add(listener);
            return () => {
                _listeners.get(key)?.delete(listener);
                if (_listeners.get(key)?.size === 0)
                    _listeners.delete(key);
            };
        },
        delete: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            const _listeners = this.getMap(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const existed = _state.delete(key);
            if (_persistKeys.has(key)) {
                _persistKeys.delete(key);
                _persistent.delete(key);
            }
            _listeners.get(key)?.forEach((l) => l(undefined));
            _listeners.delete(key);
            return MaybePromise(existed);
        },
        entries: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            return MaybePromise(Array.from(_state.entries()));
        },
        persist: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            _persistKeys.set(key, true);
        },
        unpersist: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            _persistKeys.delete(key);
            _persistent.delete(key);
        },
        has: (key, opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            return _state.has(key) || (_persistKeys.has(key) && _persistent.has(key));
        },
        clear: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _listeners = this.getMap(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            _state.clear();
            _listeners.clear();
        },
        clearPersistent: (opts = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }) => {
            const { sl_reg, ms_reg, globalKey } = opts;
            const _persistent = this.getMap(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
            const _persistKeys = this.getMap(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            _persistent.clear();
            _persistKeys.clear();
        },
        _emit: (key, sl_reg = this.s, ms_reg = this.m, globalKey = this.r) => {
            const opts = { sl_reg, ms_reg, globalKey };
            const _state = this.getMap(sl_reg, ms_reg, globalKey);
            const _listeners = this.getMap(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
            const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
            this.scheduleNotify(key, _listeners, _state);
            this.scheduleGlobalNotify(key, meta, opts);
        },
    };
    // #endregion
    //                                                                                                 [SUB]
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
            this.#anySubs.add(fn);
            return () => {
                this.#anySubs.delete(fn);
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
        this.#anySubs.deleteAll(fns);
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
    //                                                                                             [ATROMIC]
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
// #endregion
function safeCall(fn, ...args) {
    try {
        fn(...args);
    }
    catch (e) {
        process.emitWarning(e);
    }
}
export { ZeroStore };
export default new ZeroStore();
