//                                                                                               [STORE]
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
const { EventEmitter } = require("node:events");

export class Mesh extends EventEmitter {
	public r = "THE_WIZARD_ROOT_REG";
	public m = "SAURON_MASTER_REG";
	public s = "SAURON_SLAVE_REG";
    public k: S = "K_KEY";
	//                                                                                           [CONSTANTS]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
	#waiters = new M2<S, SET2<A>>(); // { key, predicate, resolve, reject, timer }
	#data = new M2();
	#subs = new M2(); // key -> Set<fn>   (key-specific)
	#any_subs = new SET2(); // global watchers
	#frozen = false;

	#context = new M2();
	#meta_context = new M2();
	#global_notify_context = new WeakMap<A, Map<A, () => V>>();
	#notify_context = new WeakMap<Map<A, Set<(value: A) => V>>, Map<A, () => V>>();


	// #endregion
	//                                                                                               [STATE]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
    _globalNotifyCache = new WeakMap<A, Map<A, () => void>>();
	_notifyCache = new WeakMap<Map<A, Set<(value: A) => void>>, Map<A, () => void>>();
	public scheduleGlobalNotify(key: string | symbol, meta: A, opts: ScopeOptions): void {
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
    getMap <K, V>(slave: A = this.s, master: A = this.m, rk: A = this.r): M2<K, V>  {
        let root = this.#context.get(rk); // (globalThis as any)[rk]  //  ; (globalThis as any)[rk] = root;
        if (!root) {
            root = new M2<A, M2I<A, M2I<A, A>>>();
            this.#context.set(rk, root);
        }

        let masterMap = root.get(master);
        if (!masterMap) {
            masterMap = new M2<A, M2I<A, A>>();
            root.set(master, masterMap);
        }

        let slaveMap = masterMap.get(slave);
        if (!slaveMap) {
            slaveMap = new M2<K, V>();
            masterMap.set(slave, slaveMap);
        }
        return slaveMap;
    }
    getMetadata(s = this.s, m = this.m, r = this.r)  {
        let root = this.#meta_context.get(r); //  (globalThis as A)[r]; // STATE_CONTEXT === "sauron" ?  : null;
        if (!root) {
            root = new M2<A, M2I<A, M2I<A, A>>>();
            this.#meta_context.set(r, root);
        }

        let masterMap = root.get(m);
        if (!masterMap) {
            masterMap = new M2<A, M2I<A, A>>();
            root.set(m, masterMap);
        }

        let metaMap = masterMap.get(s);
        if (!metaMap) {
            metaMap = {
                _batches: new Set<S | SY>(),
                _batchQueue: new Map<S | SY, A>(),
                _batchOpts: new Map<S | SY, { triggerRender?: B }>(),
                _history: new Map<S | SY, A[]>(),
                _timeTravel: new Map<S | SY, N>(),
                _globalListeners: new Set<(key: S | SY, value: A) => V>(),
                _global_subscribers: new Map<S, Set<() => V>>(),
                _waiters: new Map<S | SY, Set<(value: A) => V>>(),
                _sys: new Map<S, A>(),
                _sealed: new Set<S>(),
                _frozen: new Set<S>(),
                _keyContracts: new Map<S, Set<S>>(),
                _conflicts: new Map<S, A>(),
                _conflictStrategies: new Map<S, "latest" | "fail" | "accumulate">(),
                _causal: new Map<S, A[]>(),
                _scopes: new Map<S, A>(),
                _msgHandlers: new Map<S, Set<(p: A) => V>>(),
                _lastWriteSource: new Map<S, S>(),
                _mainMap: new Map<A, S>(),
                _tupleCache: new Map<S, S>(),
                _weakMap: new WeakMap<O, S>(),
                _boundaries: new WeakMap<O, S>(),
            };
            masterMap.set(s, metaMap);
        }
        return metaMap;
    }
    #hotPath = this.getMap(this.s, this.m, this.r)
    #persistent = this.getMap(`${this.s}_PERSISTENT`, this.m, this.r)
    #persistent_keys = this.getMap(`${this.s}_PERSIST_KEYS`, this.m, this.r)
    #listeners = this.getMap(`${this.s}_LISTENERS`, this.m, this.r)
	public store = {
		get: <T = A,>(key: A, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): T | undefined => {
			// const { sl_reg, ms_reg, globalKey } = opts;
			// const _state = this.#hotPath;
			// const _persistent =  this.#persistent
			// const _persistKeys = this.#persistent_keys
			// recordDependency(key)
			if (this.#hotPath.has(key)) return MaybePromise(this.#hotPath.get(key));
			if (this.#persistent_keys.has(key) && this.#persistent.has(key)) {
				const v = this.#persistent.get(key);
				this.#hotPath.set(key, v);
				return MaybePromise(v);
			}
			return undefined;
		},
		set: <T = A,>(key: A, value: T | ((prev: T | undefined) => T), opts: { triggerRender?: boolean; cap?: number } & ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r, triggerRender: true, cap: 200 }) => {
			const { triggerRender = true, sl_reg, ms_reg, globalKey, cap } = opts;
			// const _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			// const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			// const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			// const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			const prev = this.#hotPath.get(key);
			const next = typeof value === "function" ? (value as (prev: T | undefined) => T)(prev) : value;
			if (Object.is(prev, next)) return;
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
			if (this.#persistent_keys.has(key)) this.#persistent.set(key, next);
			if (triggerRender) this.scheduleGlobalNotify(key, this.getMetadata(sl_reg, ms_reg, globalKey), opts);
			if (triggerRender) this.scheduleNotify(key, this.#listeners, this.#hotPath);
			return MaybePromise(next as T);
		},
		subscribe: <T = A,>(key: A, listener: (value: T) => void, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): (() => void) => {
			const { sl_reg, ms_reg, globalKey } = opts;
			// const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);

			if (!this.#listeners.has(key)) this.#listeners.set(key, new Set());
			this.#listeners.get(key)!.add(listener);
			return () => {
				this.#listeners.get(key)?.delete(listener);
				if (this.#listeners.get(key)?.size === 0) this.#listeners.delete(key);
			};
		},
		delete: (key: A, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): boolean => {
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
		entries: <T = A,>(opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): [A, T][] => {
			const { sl_reg, ms_reg, globalKey } = opts;
		//	const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			return MaybePromise(Array.from(this.#hotPath.entries()));
		},
		persist: (key: A, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			//const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
            this.#persistent_keys.set(key, true);
		},
		unpersist: (key: A, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			//const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			//const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			this.#persistent_keys.delete(key);
			this.#persistent.delete(key);
		},
		has: (key: A, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): boolean => {
			const { sl_reg, ms_reg, globalKey } = opts;
			//const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			//const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			//const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);

			return this.#hotPath.has(key) || (this.#persistent_keys.has(key) && this.#persistent.has(key));
		},
		clear: (opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			//const  _state = this.getMap<A, A>(sl_reg, ms_reg, globalKey);
			//const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			this.#hotPath.clear();
			this.#listeners.clear();
		},
		clearPersistent: (opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			//const _persistent = this.getMap<A, A>(`${sl_reg}_PERSISTENT`, ms_reg, globalKey);
			//const _persistKeys = this.getMap<A, boolean>(`${sl_reg}_PERSIST_KEYS`, ms_reg, globalKey);
			this.#persistent.clear();
			this.#persistent_keys.clear();
		},
		_emit: (key: string | symbol, sl_reg = this.s, ms_reg = this.m, globalKey = this.r): void => {
			const opts = { sl_reg, ms_reg, globalKey };
			//const  _state = this.getMap(sl_reg, ms_reg, globalKey);
			//const _listeners = this.getMap<A, Set<(value: A) => void>>(`${sl_reg}_LISTENERS`, ms_reg, globalKey);
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
			this.scheduleNotify(key, this.#listeners, this.#hotPath);
			this.scheduleGlobalNotify(key, meta, opts);
		},
	};
	public state = {
		get: <T = A,>(key: string | symbol, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): T | undefined => {
			return MaybePromise(this.store.get<T>(key, opts) as T);
		},
		set: <T = A,>(key: string | symbol, value: T | ((prev: T | undefined) => T), opts: { triggerRender?: boolean } & ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey, triggerRender = true } = opts;
			this.store.set(key, value, { triggerRender, sl_reg, ms_reg, globalKey });
			return MaybePromise(value as T);
		},
		delete: (key: string | symbol, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): boolean => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
			const deleted = this.store.delete(key, opts);
			if (deleted) {
				for (const listener of meta._globalListeners) {
					try {
						listener(key, undefined);
					} catch (err) {
						console.error(`[Sauron Global Listener Error]:`, err);
					}
				}
			}
			return deleted;
		},
		getByPrefix: <T = A,>(prefix: string, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): { key: string; value: T }[] => {
			return this.store
				.entries<T>(opts)
				.filter(([key]) => typeof key === "string" && key.startsWith(prefix))
				.map(([key, value]) => ({ key: key as string, value }));
		},
		getAll: <T = A,>(opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): Record<string | symbol, T> => {
			const result: Record<string | symbol, T> = {};
			for (const [key, value] of this.store.entries<T>(opts)) {
				result[key] = value;
			}
			return result;
		},
		subscribe: <T = A,>(key: string | symbol, listener: (value: T) => void, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): (() => void) => {
			return this.store.subscribe<T>(key, listener, opts);
		},
		subscribeAll: (listener: (key: string | symbol, value: A) => void, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): (() => void) => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
			meta._globalListeners.add(listener);
			return () => {
				meta._globalListeners.delete(listener);
			};
		},
		clear: (opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): void => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);
			this.store.clear(opts);
			meta._waiters.clear();
			meta._globalListeners.clear();
		},
		waitFor: <T = A,>(key: string | symbol, opts: ScopeOptions = { sl_reg: this.s, ms_reg: this.m, globalKey: this.r }): Promise<T> => {
			const { sl_reg, ms_reg, globalKey } = opts;
			const meta = this.getMetadata(sl_reg, ms_reg, globalKey);

			// If it already exists, resolve immediately
			const existing = this.state.get<T>(key, opts);
			if (existing !== undefined) return Promise.resolve(existing);

			return new Promise<T>((resolve) => {
				if (!meta._waiters.has(key)) meta._waiters.set(key, new Set());
				meta._waiters.get(key)!.add(resolve as A);
			});
		},
	};
	public onFlush(cb: FlushCallback): void {
		this.dirty.add(cb);
		this.scheduleDrain();
	}
	public scheduleDrain(): void {
		if (this._flushScheduled) return;
		this._flushScheduled = true;
		queueMicrotask(this.drain);
	}
	public drain(): void {
		this._flushScheduled = false;
		if (this.dirty.size === 0) return;

		// An explicit openBatch() scope is still open (deliberately spanning an await) —
		// don't drop the pending callbacks, just wait for closeBatch() to let them through.
		if (this.openScopes.size > 0) {
			this.scheduleDrain();
			return;
		}

		const callbacks = this.dirty;
		this.dirty = new Set();
		for (const cb of callbacks) cb();
	}
	// #endregion
	//                                                                                                 [SET]
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
		let set = this.#subs.getOrM(  () => new SET2(), key);
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
		this.#any_subs.deleteAll(fns);
	}
	public subscribersOf(keys: S[]): A {
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
	public getAll(): A {
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
			this.#waiters.getOrM(() => new SET2() as A, key).add(waiter);
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
	//                                                                                              [ATOMIC]
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
	//                                                                                               [OTHER]
	// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
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
	public snapshot(): A {
		return this.#data.clone();
	}
	public equals(other: A) {
		return this.#data.equals(other);
	}
	public snapshotSubs() {
		return this.#subs.mapValues((set: any) => set.clone());
	}
	// #endregion

}

