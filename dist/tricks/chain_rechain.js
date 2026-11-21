export class BYTE_ID {
    /*  ==========================================================================================================================
         provides lightweight numeric and string ID generation, using a Uint32Array counter for incrementing byte-level IDs and
         a separate counter for string IDs. It also preallocates fixed-size timestamp and resolver arrays to
         track up to 4,096 pending operations.
    
         The update byteid function now shares the counter with sid, the string variant. At the smae time, a rollover counter that
         increments whenever the 32-bit counter wraps. Keeping the fact U32Array counter while producing ids that remain unique.
        ================================================================================ ⇦✦──⇦✦──✦──✦──← 'pew pew' 🧙 [BYTE_ID] */
    MAX_PENDING = 4096;
    sentTimestamps;
    pendingResolvers;
    cursor = 0;
    counter;
    epoch = 0;
    _byteid() {
        const g = globalThis;
        const c = g._sauronIdCounter ?? (g._sauronIdCounter = new Uint32Array(1));
        if (++c[0] === 0)
            this.epoch++;
        g._sauronIdCounter = c;
        return `${this.epoch}:${c[0]}`;
    }
    _sid() {
        return this._byteid();
    }
    constructor() {
        this.counter = new Uint32Array(1);
        this.sentTimestamps = new Float64Array(this.MAX_PENDING);
        this.pendingResolvers = new Array(this.MAX_PENDING);
    }
}
const _bid = new BYTE_ID();
const sk = '_s_key_';
const mk = '_m_key_';
const rk = '_r_key_';
const cellStore = new Map();
export function useCell(v, k = `${_bid._byteid()}_USECELL`, s = sk, m = mk, r = rk) {
    const cellKey = `${k}:${s}:${m}:${r}`;
    // Initialize local state if not present
    if (!cellStore.has(cellKey)) {
        const initial = typeof v === "function" ? v() : v;
        cellStore.set(cellKey, initial);
    }
    const currentState = cellStore.get(cellKey);
    // Mock local setter that mimics setLive behavior
    const setLive = (next) => {
        const current = cellStore.get(cellKey);
        const newValue = typeof next === "function" ? next(current) : next;
        cellStore.set(cellKey, newValue);
        return newValue;
    };
    return [currentState, setLive];
}
export function cell(v, k = `${_bid._byteid()}_USECELL`, s = sk, m = mk, r = rk) {
    const cellKey = `${k}:${s}:${m}:${r}`;
    // Initialize if not already present in the fallback store
    if (!cellStore.has(cellKey)) {
        const initial = typeof v === "function" ? v() : v;
        cellStore.set(cellKey, initial);
    }
    const currentState = cellStore.get(cellKey);
    // Matches your MCR_Com bo return structure (read-only, no setter)
    return currentState;
}
export const refStore = new Map();
export function atom(v, k = `__THE_WARLOCK_SIGNALS_${_bid._byteid()}`, s = sk, m = mk, r = rk) {
    const rk = `${k}:${s}:${m}:${r}`;
    if (!refStore.has(rk))
        refStore.set(rk, { current: typeof v === "function" ? v() : v });
    const ref = refStore.get(rk);
    return {
        get value() {
            return ref.current;
        },
        set value(v) {
            ref.current = v;
        },
        peek() {
            return ref.current;
        },
        get current() {
            return ref.current;
        },
        set current(v) {
            ref.current = v;
        },
        set crt(v) {
            ref.current = v;
        },
        set set(v) {
            ref.current = v;
        },
    };
}
export function Maybe_Chain(v) {
    return MaybePromise(new Chain(v));
}
export function Maybe_ReChain(v) {
    return MaybePromise(new ReChain(v, `Maybe_ReChain:${_bid._byteid()}`));
}
export function MCR_Combo(v, chain) {
    if (chain === "chain")
        return MaybePromise(new Chain(v));
    if (chain === "rechain")
        return MaybePromise(new ReChain(v, `Maybe_ReChain:${_bid._byteid()}`));
    return MaybePromise(v);
}
export class Chain {
    initial_value;
    id;
    constructor(value, id) {
        this.initial_value = value;
        this.id = id ? id : Math.random().toString(36).substring(2, 9);
    }
    _use() {
        return useCell(this.initial_value, `re_chain_${this.id}`);
    }
    /* ---------- branch logic ---------- */
    when(p) {
        const [v] = this._use();
        const ok = typeof p === "function" ? p(v) : p;
        return {
            then: (fn) => (ok ? fn(v) : undefined),
            otherwise: (fn) => (ok ? v : fn(v)),
        };
    }
    if(p) {
        return this.when(p);
    }
    switch() {
        const self = this;
        const [v0, setV] = this._use();
        let matched = false;
        let current = v0;
        const view = {
            case: (m, fn) => {
                if (!matched && current === m) {
                    matched = true;
                    current = fn(current);
                    setV(current);
                    self.initial_value = current;
                }
                return view;
            },
            default: (fn) => {
                if (!matched) {
                    current = fn(current);
                    setV(current);
                    self.initial_value = current;
                }
                return self;
            },
            done: () => current,
        };
        return view;
    }
    guard(p, e = new Error("guard failed")) {
        const [v] = this._use();
        if (!p(v))
            throw e;
        return this;
    }
    /* ---------- mutation steps ---------- */
    set(v) {
        const [current, setV] = this._use();
        const next = (typeof v === "function" ? v(current) : v);
        setV(next);
        this.initial_value = next;
        return this;
    }
    patch(p) {
        const [current, setV] = this._use();
        const next = { ...current, ...p };
        setV(next);
        this.initial_value = next;
        return this;
    }
    merge(o) {
        const [current, setV] = this._use();
        const next = { ...current, ...o };
        setV(next);
        this.initial_value = next;
        return this;
    }
    tap(fn) {
        const [v] = this._use();
        fn(v);
        return this;
    }
    get(k) {
        const [v] = this._use();
        return new Chain(v?.[k]);
    }
    /* ---------- async ---------- */
    then(fn) {
        const [v] = this._use();
        return Promise.resolve(v)
            .then(fn)
            .then((next) => new Chain(next));
    }
    catch(fn) {
        const [v] = this._use();
        return Promise.resolve(v)
            .catch(fn)
            .then((next) => new Chain(next));
    }
    retry(fn, opts = {}) {
        const attempts = opts.attempts ?? 3, base = opts.baseDelayMs ?? 2000;
        const [v0] = this._use();
        return (async () => {
            let lastErr;
            for (let i = 0; i < attempts; i++) {
                try {
                    return new Chain(await fn(v0));
                }
                catch (e) {
                    lastErr = e;
                    if (i < attempts - 1)
                        await new Promise((r) => setTimeout(r, base * 2 ** i));
                }
            }
            throw lastErr;
        })();
    }
    delay(m) {
        return new Promise((r) => setTimeout(() => r(this), m));
    }
    throw(e) {
        throw e;
    }
    done() {
        const [v] = this._use();
        return (typeof v === "function" ? v() : v);
    }
}
export class ReChain {
    initial_value;
    id;
    constructor(value, id) {
        this.initial_value = value;
        this.id = id ? id : _bid._byteid();
    }
    _use() {
        return useCell(this.initial_value, `re_chain_${this.id}`);
    }
    // The ONLY place a value changes hands — a fresh chain, nothing mutated.
    // write=true means this transformation broadcasts to the store + bus.
    step(next, write = false) {
        if (write) {
            const [, setV] = this._use();
            setV(next);
        }
        return next instanceof ReChain ? next : new ReChain(next, this.id);
    }
    // when/if/switch return a branch view: then and otherwise can BOTH be
    // written (only one fires, like Chain), and each call returns a fresh
    // ReChain — nothing mutated, order-independent.
    branch(passed) {
        const step = (next, write = false) => this.step(next, write);
        return {
            then: (fn) => (passed ? step(fn(this.done()), true) : this),
            otherwise: (fn) => (passed ? this : step(fn(this.done()), true)),
            else: (fn) => (passed ? this : step(fn(this.done()), true)),
            done: () => this.done(),
        };
    }
    when(pred) {
        const [v] = this._use();
        return this.branch(!!pred(v));
    }
    if(pred) {
        const [v] = this._use();
        return this.branch(!!pred(v));
    }
    switch() {
        const [v, setV] = this._use();
        let matched = false;
        let out = this;
        const self = this;
        return {
            case(val, fn) {
                if (!matched && (v === val || Object.is(v, val))) {
                    matched = true;
                    const next = fn(v);
                    setV(next);
                    out = new ReChain(next, self.id);
                }
                return out;
            },
            default(fn) {
                if (!matched) {
                    const next = fn(v);
                    setV(next);
                    out = new ReChain(next, self.id);
                }
                return out;
            },
            done: () => out.done(),
        };
    }
    gate(pred) {
        const [v] = this._use();
        if (!pred(v)) {
            const err = new Error("[Chain.gate] predicate failed");
            err.value = v;
            throw err;
        }
        return this;
    }
    guard(pred, onFail) {
        const [v, setV] = this._use();
        if (pred(v))
            return this;
        const fallback = onFail ? onFail(v) : v;
        setV(fallback); // write-through
        return this.step(fallback);
    }
    tap(fn) {
        const [v] = this._use();
        fn(v);
        return this;
    }
    set(k, val) {
        const [v, setV] = this._use();
        const next = { ...v, [k]: val };
        setV(next); // write-through
        return this.step(next);
    }
    patch(obj) {
        const [v, setV] = this._use();
        const next = { ...v, ...obj };
        setV(next); // write-through
        return this.step(next);
    }
    get(k) {
        const [v] = this._use();
        return new ReChain(v?.[k], _bid._byteid());
    }
    merge(other) {
        const [v, setV] = this._use();
        const next = { ...v, ...(other?.initial_value ?? other) };
        setV(next); // write-through
        return this.step(next);
    }
    delay(m) {
        return new Promise((resolve) => setTimeout(() => resolve(this), m));
    }
    throw(err) {
        throw err instanceof Error ? err : new Error(String(err));
    }
    retry(attempts, delayMs = 100) {
        return new Promise((resolve, reject) => {
            let n = 0;
            const attempt = () => {
                const [v] = this._use();
                const out = typeof v === "function" ? v() : v;
                if (out !== undefined && out !== null) {
                    Promise.resolve(out).then(resolve, reject);
                    return;
                }
                if (n++ >= attempts) {
                    reject(new Error("[Chain.retry] exhausted"));
                    return;
                }
                setTimeout(attempt, delayMs);
            };
            attempt();
        });
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    finally(fn) {
        fn();
        return this;
    }
    then(onFulfilled, onRejected) {
        const [v] = this._use();
        const raw = typeof v === "function" ? v() : v;
        return Promise.resolve(raw).then(onFulfilled, onRejected);
    }
    done() {
        const [v] = this._use();
        return (typeof v === "function" ? v() : v);
    }
}
