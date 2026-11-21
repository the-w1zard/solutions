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
	#waiters = new M2<S, SET2<A>>(); // { key, predicate, resolve, reject, timer }
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
	public getMap<K, V>(slave: A = this.s, master: A = this.m, rk: A = this.r): M2<K, V> {
		let root = this.#context; // (globalThis as any)[rk]  //  ; (globalThis as any)[rk] = root;
		if (!root) {
			root = new M2<A, Map<A, Map<A, A>>>();
			this.#context.set(rk, root);
		}

		let masterMap = root.get(master);
		if (!masterMap) {
			masterMap = new M2<A, Map<A, A>>();
			root.set(master, masterMap);
		}

		let slaveMap = masterMap.get(slave);
		if (!slaveMap) {
			slaveMap = new M2<K, V>();
			masterMap.set(slave, slaveMap);
		}
		return slaveMap;
	}
	public getMetadata(s = this.s, m = this.m, r = this.r) {
		let root = (globalThis as A)[r]; // STATE_CONTEXT === "sauron" ?  : null;
		if (!root) {
			root = new Map<A, Map<A, Map<A, A>>>();
			(globalThis as A)[r] = root;
		}

		let masterMap = root.get(m);
		if (!masterMap) {
			masterMap = new Map<A, Map<A, A>>();
			root.set(m, masterMap);
		}

		let metaMap = masterMap.get(s);
		if (!metaMap) {
			metaMap = {
				_batches: new Set<string | symbol>(),
				_batchQueue: new Map<string | symbol, A>(),
				_batchOpts: new Map<string | symbol, { triggerRender?: boolean }>(),
				_history: new Map<string | symbol, A[]>(),
				_timeTravel: new Map<string | symbol, number>(),
				_globalListeners: new Set<(key: string | symbol, value: A) => void>(),
				_global_subscribers: new Map<string, Set<() => void>>(),
				_waiters: new Map<string | symbol, Set<(value: A) => void>>(),
				_sys: new Map<string, A>(),
				_sealed: new Set<string>(),
				_frozen: new Set<string>(),
				_keyContracts: new Map<string, Set<string>>(),
				_conflicts: new Map<string, A>(),
				_conflictStrategies: new Map<string, "latest" | "fail" | "accumulate">(),
				_causal: new Map<string, A[]>(),
				_scopes: new Map<string, A>(),
				_msgHandlers: new Map<string, Set<(p: A) => void>>(),
				_lastWriteSource: new Map<string, string>(),
				_mainMap: new Map<A, string>(),
				_tupleCache: new Map<string, string>(),
				_weakMap: new WeakMap<object, string>(),
				_boundaries: new WeakMap<object, string>(),
			};
			masterMap.set(s, metaMap);
		}
		return metaMap;
	}
	public _globalNotifyCache = new WeakMap<A, Map<A, () => void>>();
	public _notifyCache = new WeakMap<Map<A, Set<(value: A) => void>>, Map<A, () => void>>();

	public scheduleGlobalNotify(key: string | symbol, meta: A, opts: A): void {
		let cache = this._globalNotifyCache.get(meta);
		if (!cache) {
			cache = new Map();
			this._globalNotifyCache.set(meta, cache);
		}
		let fn = cache.get(key);
		if (!fn) {
			fn = () => {
				cache!.delete(key);
				const finalVal = this.store.get(key, opts);
				const waiters = meta._waiters.get(key);
				if (waiters) {
					for (const resolveFn of waiters) {
						try {
							resolveFn(finalVal);
						} catch (err) {
							console.error(`[Sauron Waiter Error]:`, err);
						}
					}
					meta._waiters.delete(key);
				}
				for (const listener of meta._globalListeners) {
					try {
						listener(key, finalVal);
					} catch (err) {
						console.error(`[Sauron Global Listener Error]:`, err);
					}
				}
			};
			cache.set(key, fn);
		}
		this.onFlush(fn);
	}
	public scheduleNotify(key: A, _listeners: Map<A, Set<(value: A) => void>>, _state: Map<A, A>): void {
		let cache = this._notifyCache.get(_listeners);
		if (!cache) {
			cache = new Map();
			this._notifyCache.set(_listeners, cache);
		}
		let fn = cache.get(key);
		if (!fn) {
			fn = () => {
				cache!.delete(key);
				const val = _state.get(key);
				_listeners.get(key)?.forEach((l) => l(val));
			};
			cache.set(key, fn);
		}
		this.onFlush(fn);
	}
	public store = {
		get: <T = A,>(key: A, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): T | undefined => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);

			// recordDependency(key)
			if (_state.has(key)) return MaybePromise(_state.get(key));
			if (_persistKeys.has(key) && _persistent.has(key)) {
				const v = _persistent.get(key);
				_state.set(key, v);
				return MaybePromise(v);
			}
			return undefined;
		},
		set: <T = A,>(key: A, value: T | ((prev: T | undefined) => T), opts: { triggerRender?: boolean; cap?: number } & A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r, triggerRender: true, cap: 200 }) => {
			const { triggerRender = true, sl_reg, ms_reg, globalKey, cap } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			const prev = _state.get(key);
			const next = typeof value === "function" ? (value as (prev: T | undefined) => T)(prev) : value;
			if (Object.is(prev, next)) return;
			// TIME TRAVEL

			if (!this.root.TIME_TRAVEL._time_travel_reverting) {
				const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
				let hist = meta._history.get(key);
				if (!hist) {
					hist = [];
					meta._history.set(key, hist);
				}
				const lastActive = hist.findLastIndex((e: A) => !e.undone) ?? -1;
				if (lastActive < hist.length - 1) hist.length = lastActive + 1; // truncate redo tail
				hist.push({ k: (hist[hist.length - 1]?.k ?? 0) + 1, prev, next, ts: Date.now(), undone: false });
				const cap_val = cap ?? 200;
				while (hist.length > cap_val) hist.shift();
			}
			_state.set(key, next);
			if (_persistKeys.has(key)) _persistent.set(key, next);
			if (triggerRender) this.scheduleGlobalNotify(key, this.getMetadata(sl_reg, ms_reg, globalKey), opts);
			if (triggerRender) this.scheduleNotify(key, _listeners, _state);
			return MaybePromise(next as T);
		},
		subscribe: <T = A,>(key: A, listener: (value: T) => void, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): (() => void) => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);

			if (!_listeners.has(key)) _listeners.set(key, new Set());
			_listeners.get(key)!.add(listener);
			return () => {
				_listeners.get(key)?.delete(listener);
				if (_listeners.get(key)?.size === 0) _listeners.delete(key);
			};
		},
		delete: (key: A, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): boolean => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);

			const existed = _state.delete(key);
			if (_persistKeys.has(key)) {
				_persistKeys.delete(key);
				_persistent.delete(key);
			}
			_listeners.get(key)?.forEach((l) => l(undefined));
			_listeners.delete(key);
			return MaybePromise(existed);
		},
		entries: <T = A,>(opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): [A, T][] => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			return MaybePromise(Array.from(_state.entries()));
		},
		persist: (key: A, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			_persistKeys.set(key, true);
		},
		unpersist: (key: A, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			_persistKeys.delete(key);
			_persistent.delete(key);
		},
		has: (key: A, opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): boolean => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);

			return _state.has(key) || (_persistKeys.has(key) && _persistent.has(key));
		},
		clear: (opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			_state.clear();
			_listeners.clear();
		},
		clearPersistent: (opts: A = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			_persistent.clear();
			_persistKeys.clear();
		},
		_emit: (key: string | symbol, sl_reg = this.s, ms_reg = this.m, globalKey = this.r): void => {
			const opts = { sl_reg, ms_reg, globalKey };
			const _state = this.getMap(sl_reg, ms_reg, globalKey);
			const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
			this.scheduleNotify(key, _listeners, _state);
			this.scheduleGlobalNotify(key, meta, opts);
		},
	};
	// #endregion
	//                                                                                                 [SUB]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
	public set(key: A, value: A) {
		if (this.#frozen) throw new Error("Store is frozen");
		const prev = this.#data.swap(key, value); // returns previous, writes new
		this.#notify(key, value, prev);
		return this;
	}
	public setLazy(key: A, make: () => A) {
		const prev = this.#data.g(key);
		const value = make();
		this.#data.s(key, value);
		this.#notify(key, value, prev);
		return this;
	}
	public delete(key: A) {
		if (!this.#data.h(key)) return false;
		const prev = this.#data.take(key);
		this.#notify(key, undefined, prev);
		return true;
	}
	public clear() {
		for (const key of this.#data.toKeys()) this.#notify(key, undefined, this.#data.g(key));
		this.#data.clear();
	}
	// #endregion
	//                                                                                                 [SUB]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
	/*  ====================================================================================================
     subscribe(key, fn)  -> unsubscribe
     subscribe(fn)       -> unsubscribe (all keys)
     subscribe(key, { immediate: true }) -> async iterator
    ============================================================= ⇦✦──⇦✦──✦──✦──← 'pew pew' 🧙 [STORE] */
	public subscribe(fn: (value: A, prev: A, key: S) => V): () => V;
	public subscribe(key: S, fn: (value: A, prev: A, key: S) => V, opts?: { immediate?: B }): () => V;
	public subscribe(key: S, opts?: { immediate?: B }): AsyncGenerator<A, V, U>;
	public subscribe(keyOrFn: S | ((value: A, prev: A, key: S) => V), maybeFn?: ((value: A, prev: A, key: S) => V) | { immediate?: B }, opts: { immediate?: B } = {}): (() => V) | AsyncGenerator<A, V, U> {
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
        const fn = maybeFn as (value: A, prev: A, key: S) => V;
        let set = this.#subs.getOrM(() => new SET2(), key);
        set.add(fn);

        if (opts.immediate && this.#data.has(key)) {
            queueMicrotask(() => fn(this.#data.get(key), undefined, key));
        }
		// unsubscribe
		return () => {
			const set = this.#subs.g(key);
			if (!set) return;
			set.delete(fn);
			if (set.size === 0) this.#subs.d(key);
		};
	}
	public unsubscribeAll(fns: Iterable<FN>) {
		for (const set of this.#subs.values()) set.deleteAll(fns);
		this.#anySubs.deleteAll(fns);
	}
	public subscribersOf(keys: S[]): SET2<FN> {
		let out = new SET2<FN>();
		for (const key of keys) {
			const set = this.#subs.g(key);
			if (set) out = out.union(set);
		}
		return out;
	}
	async *#asIterator(key: A, { immediate = false } = {}) {
		// buffer events so a slow consumer doesn't lose them
		const queue: A = [];
		let resolve: A;
		let done = false;
		const push = (v: A) => {
			queue.push(v);
			if (resolve) {
				const r = resolve;
				resolve = null;
				r();
			}
		};
		const unsub = this.subscribe(key, (v: A, prev: A) => push({ value: v, prev }));
		const stop = this.subscribe((k: A, v: A, prev: A) => {
			if (k === key) push({ value: v, prev });
		});

		try {
			if (immediate && this.has(key)) yield this.get(key);
			while (!done) {
				if (queue.length === 0) await new Promise((r) => (resolve = r));
				while (queue.length) yield queue.shift().value;
			}
		} finally {
			unsub();
			stop();
		}
	}
	#notify(key: A, value: A, prev: A) {
		const waiting = this.#waiters.get(key);
		if (waiting) {
			for (const w of waiting) {
				if (!w.predicate(value, prev)) continue;
				w.cleanup();
				w.resolve(value);
			}
		}
	}
	// #endregion
	//                                                                                                [GETS]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
	public get<T = A>(key: S): T | UD;
	public get<T = A>(key: S, fallback: T): T;
	public get<T = A>(key: S, fallback?: T): T | UD {
		return this.#data.has(key) ? this.#data.get(key) : fallback;
	}
	public getAll(): M2<A, A> {
		return this.#data.clone();
	}
	public has(key: A) {
		return this.#data.has(key);
	}
	public freeze() {
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
	public wait(key: A, { predicate = () => true, timeout, immediate = true, signal }: A = {}) {
		// Fast path: value already satisfies
		if (immediate && this.#data.has(key) && predicate(this.#data.get(key), undefined)) {
			return Promise.resolve(this.#data.get(key));
		}

		return new Promise((resolve, reject) => {
			const waiter = { key, predicate, resolve, reject, timer: null } as A;

			const cleanup = () => {
				this.#waiters.delete(waiter);
				if (waiter.timer) clearTimeout(waiter.timer);
				if (signal) signal.removeEventListener("abort", onAbort);
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
				if (signal.aborted) return onAbort();
				signal.addEventListener("abort", onAbort, { once: true });
			}

			waiter.cleanup = cleanup;
			this.#waiters.getOrM(() => new SET2(), key).add(waiter);
		});
	} // Convenience: wait for a *change* (ignore current value)
	public waitChange(key: A, opts = {}) {
		return this.wait(key, { ...opts, immediate: false });
	}
	// Convenience: wait until predicate holds for the current or next value
	public waitFor(key: A, predicate: A, opts = {}) {
		return this.wait(key, { ...opts, predicate });
	}
	// #endregion
	//                                                                                             [ATROMIC]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
	public setIfAbsent(key: A, value: U) {
		if (!this.#data.setIfAbsent(key, value)) return false;
		this.#notify(key, value, undefined);
		return true;
	}
	public setIfPresent(key: A, value: U) {
		const prev = this.#data.g(key);
		if (!this.#data.setIfPresent(key, value)) return false;
		this.#notify(key, value, prev);
		return true;
	}
	public replace(key: A, value: U) {
		return this.setIfPresent(key, value);
	}
	public update(key: A, fn: (old: A, has: B) => A, initial: U) {
		const had = this.#data.h(key);
		const prev = had ? this.#data.g(key) : undefined;
		const next = this.#data.update(key, fn, initial);
		this.#notify(key, next, prev);
		return next;
	}
	public inc(key: A, by = 1) {
		const prev = this.#data.g(key);
		const next = this.#data.inc(key, by);
		this.#notify(key, next, prev);
		return next;
	}
	public touch(key: A) {
		// register interest without overwriting — useful for the "subscribed but not yet written" case
		if (!this.#data.setIfAbsent(key, undefined)) return false;
		this.#notify(key, undefined, undefined);
		return true;
	}
	// #endregion
	public toJSON() {
		return this.#data.toObject();
	}
	public entries() {
		return this.#data.toArray();
	}
	public keys() {
		return this.#data.toKeys();
	}
	public values() {
		return this.#data.toValues();
	}
	public find(pred: A) {
		return this.#data.find(pred);
	}
	public findKey(pred: A) {
		return this.#data.findKey(pred);
	}
	public group(fn: A) {
		return this.#data.group(fn);
	}
	public pick(keys: A) {
		return this.#data.pick(keys);
	}
	public omit(keys: A) {
		return this.#data.omit(keys);
	}
	public snapshot(): M2<A, A> {
		return this.#data.clone();
	}
	public equals(other: A) {
		return this.#data.equals(other);
	}
	public snapshotSubs() {
		return this.#subs.mapValues((set) => set.clone());
	}
}
// #endregion

function safeCall(fn: A, ...args: A) {
	try {
		fn(...args);
	} catch (e: A) {
		process.emitWarning(e);
	}
}

export { ZeroStore };
export default new ZeroStore();
