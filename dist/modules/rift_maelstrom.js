function MaybePromise(v) {
    return v !== undefined ? v : Promise.resolve(v);
}
// #endregion ──────────────────────────────────────────────────────────────────────────────────
//                                                                        Rift — the local shape
// #region ─────────────────────────────────────────────────────────────────────────────────────
//
// A named slot holding a value that may not have landed yet. In-process. It carries, on
// itself, everything the registry needs from it: the value, the open/claim state, the
// subscriber set (THE one subscription mechanism for this entry), the solver tag of whoever
// produced its value, and — when the entry holds a module — its export index and inflight
// promise. Nothing about a result is stored anywhere else.
class Rift {
    // ── slot state ──────────────────────────────────────────────────────────────────────────────
    opened = false;
    claimed = false;
    value;
    resolveFn;
    gate;
    createdAt = Date.now();
    openedAt;
    // ── the ONE subscriber mechanism for this entry (cloud entries inherit it) ──────────────────
    listeners = [];
    notify(v) {
        for (const l of this.listeners) {
            try {
                l(v);
            }
            catch { /* listener errors never break the rift */ }
        }
    }
    // ── provenance + registry bookkeeping (set by MAELSTROM when a solver records an outcome) ───
    solver;
    store;
    version = 0;
    inflight;
    exports = new Map(); // name → (moduleKey → export)  — lives ON the entry
    constructor() { this.gate = this.makeGate(); }
    makeGate() {
        return new Promise((resolve) => { this.resolveFn = resolve; });
    }
    /**
     * Default is "wait forever". Explicit timeout = opt-in rejection.
     * A rift that has not landed is not an error — it is a promise.
     */
    wait(timeoutMs = 0) {
        if (!timeoutMs)
            return this.gate;
        let timer;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`)), timeoutMs);
        });
        return Promise.race([this.gate, timeout]).finally(() => clearTimeout(timer));
    }
    open(v) {
        if (this.opened)
            return; // idempotent — first open wins
        this.opened = true;
        this.openedAt = Date.now();
        this.value = v;
        this.resolveFn(v);
        this.notify(v);
    }
    reset() {
        this.opened = false;
        this.claimed = false;
        this.value = undefined;
        this.openedAt = undefined;
        this.gate = this.makeGate();
    }
    /** one solver wins the right to fetch this slot — everyone else just waits for it */
    claim() {
        if (this.claimed)
            return false;
        this.claimed = true;
        return true;
    }
    /** the one subscribe call for this entry */
    onOpen(listener) {
        this.listeners.push(listener);
        return () => { const i = this.listeners.indexOf(listener); if (i !== -1)
            this.listeners.splice(i, 1); };
    }
    get isOpen() { return this.opened; }
    get isClaimed() { return this.claimed; }
    get current() { return this.value; }
}
// #endregion ──────────────────────────────────────────────────────────────────────────────────
//                                                                                REACTIVE_STORE
// #region ─────────────────────────────────────────────────────────────────────────────────────
// Same contract as Rift, but the slot lives in a shared store: writes are visible to every
// reader of the same label, and onOpen subscriptions fire across all holders. Its reactive
// store is the cloud shape's own backbone — one store, one subscription mechanism.
class REACTIVE_STORE {
    records = new Map();
    listeners = new Map();
    get(key) { return this.records.get(key); }
    set(key, record) {
        this.records.set(key, record);
        const subs = this.listeners.get(key);
        if (subs)
            for (const l of [...subs]) {
                try {
                    l(record);
                }
                catch { /* one bad listener never kills the rest */ }
            }
    }
    sub(key, fn) {
        let subs = this.listeners.get(key);
        if (!subs) {
            subs = new Set();
            this.listeners.set(key, subs);
        }
        subs.add(fn);
        return () => {
            const s = this.listeners.get(key);
            if (!s)
                return;
            s.delete(fn);
            if (!s.size)
                this.listeners.delete(key);
        };
    }
    delete(key) { this.records.delete(key); this.listeners.delete(key); }
    clear() { this.records.clear(); this.listeners.clear(); }
    get size() { return this.records.size; }
}
export const RX_STORE = new REACTIVE_STORE();
// #endregion ──────────────────────────────────────────────────────────────────────────────────
//                                                                   CloudRift — the cloud shape
// #region ─────────────────────────────────────────────────────────────────────────────────────
// ONE location. A CloudRift with a given name IS the pooled resource: the same value, the
// same gate, the same subscriber list as every other CloudRift of that name — because it IS
// the same entry. The machine's registry is the only address book; two tiny hooks wire the
// canonical lookup. No record map, no second subscriber map, no shadowing anywhere.
// ─────────────────────────────────────────────────────────────────────────────────────────────
function wait_and_promise(timeoutMs, key, isOpen, current) {
    return new Promise((resolve, reject) => {
        let timer;
        const unsub = RX_STORE.sub(key, (next) => {
            if (next?.opened) {
                if (timer)
                    clearTimeout(timer);
                unsub();
                resolve(next.value);
            }
        });
        if (isOpen) { // opened while we were subscribing
            if (timer)
                clearTimeout(timer);
            unsub();
            resolve(current);
            return;
        }
        if (timeoutMs) {
            timer = setTimeout(() => {
                unsub();
                reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        }
    });
}
class CloudRift {
    key;
    constructor(name) {
        this.key = `${name}`;
        if (!RX_STORE.get(name))
            RX_STORE.set(name, this.emptyRecord());
    }
    emptyRecord() {
        return { opened: false, claimed: false, value: undefined, createdAt: Date.now(), openedAt: undefined };
    }
    record() { return RX_STORE.get(this.key) ?? this.emptyRecord(); }
    get createdAt() { return this.record().createdAt; }
    get openedAt() { return this.record().openedAt; }
    get isOpen() { return this.record().opened; }
    get isClaimed() { return this.record().claimed; }
    get current() { return this.record().value; }
    wait(timeoutMs = 0) {
        const rec = this.record();
        if (rec.opened)
            return rec.value;
        else {
            return wait_and_promise(timeoutMs, this.key, this.isOpen, this.current);
        }
    }
    open(value) {
        const rec = this.record();
        if (rec.opened)
            return; // best-effort idempotency — see claim() note above
        RX_STORE.set(this.key, { ...rec, opened: true, value, openedAt: Date.now() });
    }
    reset() {
        const rec = this.record();
        RX_STORE.set(this.key, { ...this.emptyRecord(), createdAt: rec.createdAt });
    }
    claim() {
        const rec = this.record();
        if (rec.claimed)
            return false;
        RX_STORE.set(this.key, { ...rec, claimed: true });
        return true;
    }
    onOpen(listener) {
        return RX_STORE.sub(this.key, (next) => { if (next?.opened)
            listener(next.value); });
    }
}
// #endregion ──────────────────────────────────────────────────────────────────────────────────
//                                     ORC_SHOUT — the real logger, carried in whole, unmodified
// #region ─────────────────────────────────────────────────────────────────────────────────────
class ORC_SHOUT {
    c = {
        emerald: { 10: "#002c22", 9: "#004f3b", 8: "#016630", 7: "#007a55", 6: "#009966", 5: "#00bc7d" },
        blue: { 10: "", 9: "", 8: "", 7: "", 6: "", 5: "" },
    };
    t = {
        deep: {
            bg: "#020817", txt: "#f8fafc", size: 12, title_size: 14, title_txt: "#94a3b8",
            payload_key: "#a4ed2c", payload_value: "#f8fafc", font: "monospace",
            border: "2px solid #101727", borderRadius: "6px", padding: "8px 16px", svg: "",
        },
        vintage: {
            bg: "#001B29", txt: "#e9e1ba", size: 12, title_size: 14, title_txt: "#ada785",
            payload_key: "#29c3a0", payload_value: "#fafafa", font: "monospace",
            border: "2px solid #112932", borderRadius: "6px", padding: "8px 16px", svg: "",
        },
        error: {
            bg: "#09090B", txt: "#e7000b", size: 12, title_size: 14, title_txt: "#9f0712",
            payload_key: "#a4ed2c", payload_value: "#f8fafc", font: "monospace",
            border: "2px solid #e7000b", borderRadius: "6px", padding: "8px 16px",
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e7000b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
        },
        warn: {
            bg: "#09090B", txt: "#e17100", size: 12, title_size: 14, title_txt: "#973c00",
            payload_key: "#a4ed2c", payload_value: "#f8fafc", font: "monospace",
            border: "2px solid #e17100", borderRadius: "6px", padding: "8px 16px",
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e17100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        },
        success: {
            bg: "#09090B", txt: "#009966", size: 12, title_size: 14, title_txt: "#016630",
            payload_key: "#a4ed2c", payload_value: "#f8fafc", font: "monospace",
            border: "2px solid #009966", borderRadius: "6px", padding: "8px 16px",
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009966" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`,
        },
        info: {
            bg: "#09090B", txt: "#155dfc", size: 12, title_size: 14, title_txt: "#193cb8",
            payload_key: "#a4ed2c", payload_value: "#f8fafc", font: "monospace",
            border: "2px solid #155dfc", borderRadius: "6px", padding: "8px 16px",
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#155dfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
        },
    };
    log(msg, p, theme = this.t.deep) {
        const isArray = Array.isArray(msg);
        const title = isArray ? msg[0] : msg;
        const paragraphs = isArray ? msg.slice(1) : [];
        const containerStyle = `
              background: ${theme.bg};
              ${theme.border ? `border: ${theme.border};` : ""}
              ${theme.borderRadius ? `border-radius: ${theme.borderRadius};` : ""}
              ${theme.padding ? `padding: ${theme.padding};` : ""}
              font-family: ${theme.font};
              display: block;
              margin: 4px 0;
          `;
        const titleWithIcon = theme?.svg ? `${theme?.svg} ${title}` : title;
        const titleStyle = `
              color: ${theme.title_txt};
              font-size: ${theme.title_size}px;
              font-weight: bold;
              font-family: ${theme.font};
              display: flex;
              align-items: center;
              gap: 8px;
          `;
        const paragraphStyle = `
              color: ${theme.txt};
              font-size: ${theme.size}px;
              font-family: ${theme.font};
              margin-top: 4px;
          `;
        const keyStyle = `
              color: ${theme.payload_key};
              font-weight: bold;
              font-family: ${theme.font};
          `;
        const valueStyle = `
              color: ${theme.payload_value};
              font-family: ${theme.font};
          `;
        let payloadStr = "";
        if (p && typeof p === "object") {
            const entries = Object.entries(p);
            payloadStr = entries.map(([key, value]) => `%c${key}: %c${JSON.stringify(value, null, 2)}`).join("\n");
        }
        const logParts = [`%c${titleWithIcon}`, ...paragraphs.map((p) => `%c${p}`), payloadStr ? `\n${payloadStr}` : ""].filter(Boolean).join("\n");
        const styles = [
            containerStyle + titleStyle,
            ...paragraphs.map(() => paragraphStyle),
            ...(payloadStr ? [keyStyle, valueStyle] : []),
        ];
        console.log(logParts, ...styles);
    }
}
// #endregion ──────────────────────────────────────────────────────────────────────────────────
//                                                  CLASS 3 · MAELSTROM — the everything machine
// #region ─────────────────────────────────────────────────────────────────────────────────────
//
// ONE registry. ONE subscriber mechanism. ONE scheduler state. Every helper that used to
// litter the lineage's files — blindImport, blindRequire, get_module, has_local, key_for,
// the safe proxy, fallback normalization, environment detection — lives INSIDE this class.
class MAELSTROM {
    root = null;
    // ══ THE ONE REGISTRY ═══════════════════════════════════════════════════════════════════════
    // Every result every solver produces lives here, keyed by label. Rift values, loaded
    // modules (mod:…), sync-required modules (req:…), module checks (check:…), conjures,
    // defer deps, probe outcomes — all of it. There is no second results map anywhere.
    rifts = new Map();
    // multi-dep waiters only — a waiter on ONE label is an entry subscription (Rift.onOpen);
    // only waiters spanning MULTIPLE labels need a table row. No parallel subscriber lists.
    multiWaiters = new Set();
    nextWaiterId = 0;
    // ══ THE ONE SCHEDULER STATE ═════════════════════════════════════════════════════════════════
    // Deferred tasks (not results — the results ARE the registry entries above).
    deferTasks = new Map();
    nextDeferId = 0;
    draining = false;
    drainAgain = false;
    deferStats = { registered: 0, executed: 0, completed: 0, failed: 0, cancelled: 0 };
    autoCloud = undefined;
    warnedUseBeforeReady = false;
    ENV_STATE = { moduleLevel: null, platform: null, compilers: [], bundler: null, adapters: [], ready: false };
    shout = new ORC_SHOUT();
    constructor(root = null) {
        this.root = root;
        this.RITUAL_OF_BINDING();
    }
    FULFIL_THIS_NOW(r) { this.root = r; }
    REFRESH_ROOT() {
        try {
            return this.root?.acquire_root?.('MAELSTROM') ?? this.root;
        }
        catch {
            return this.root;
        }
    }
    RITUAL_OF_BINDING() { }
    // ── logging through ORC_SHOUT — never a stand-in ───────────────────────────────────────────
    log(where, detail = {}, type = 'info') {
        const payload = { ...detail };
        if (payload.error instanceof Error)
            payload.error = payload.error.message;
        this.shout.log(`[MAELSTROM][${where}]`, payload, this.shout.t[type] ?? this.shout.t.deep);
    } /** dynamic import with no static dependency — works in every module system */
    static blindImport = new Function('specifier', 'return import(specifier)');
    /** require with no static dependency — null where require does not exist (browser/ESM) */
    static blindRequire = (typeof require !== 'undefined') ? new Function('specifier', 'return require(specifier)') : null;
    static has_require = MAELSTROM.blindRequire !== null;
    static hasNode = typeof process !== 'undefined' && !!process?.versions?.node;
    static hasBun = typeof process !== 'undefined' && !!process?.versions?.bun;
    /** resolve a specifier relative to THIS file, always. Absolute out. */
    key_for(specifier) {
        try {
            return import.meta.resolve(specifier);
        }
        catch {
            try {
                return new URL(specifier, import.meta.url).href;
            }
            catch {
                return specifier;
            }
        }
    } /** does a local file exist, resolved from cwd — the has_local probe */
    has_local(filePath, module) {
        try {
            if (!MAELSTROM.hasNode && !MAELSTROM.hasBun)
                return false;
            if (!filePath) {
                this.log('HAS_LOCAL', { note: 'FILE PATH UNDEFINED — DEFINE A PATH', module, type: 'SYNC' }, 'error');
                return false;
            }
            const path = MAELSTROM.blindRequire('path');
            const fs = MAELSTROM.blindRequire('fs');
            const resolved = path.resolve(process.cwd(), filePath);
            return fs.existsSync(resolved);
        }
        catch (e) {
            this.log('HAS_LOCAL', { module, type: 'SYNC', error: e }, 'error');
            return false;
        }
    } /**
     * get_module: require the specifier → local file read → builtin check → cwd-resolved
     * require → async import as the last resort. Every sync path is tried before anything
     * returns a promise.
     */
    get_module(module, filePath) {
        const br = MAELSTROM.blindRequire;
        try {
            let v = null;
            try {
                v = br(module);
                return MaybePromise(v);
            }
            catch (e) {
                this.log('GET_MODULE', { module, type: 'SYNC', import_used: 'blindRequire', error: e }, 'error');
            }
            if (module && this.has_local(filePath, module)) {
                const fs = br('fs');
                const path = br('path');
                const resolved = path.resolve(process.cwd(), filePath);
                if (fs.existsSync(resolved)) {
                    v = fs.readFileSync(resolved, 'utf8').trim();
                    return MaybePromise(v);
                }
            }
            if (this.has_local(filePath)) {
                const path = br('path');
                const resolved = path.resolve(process.cwd(), filePath);
                try {
                    v = br(resolved);
                    return MaybePromise(v);
                }
                catch (e) {
                    this.log('GET_MODULE', { module, filePath, type: 'SYNC', import_used: 'local', error: e }, 'error');
                }
            }
            if (MAELSTROM.hasNode || MAELSTROM.hasBun) {
                const fs = br('fs');
                const { isBuiltin } = br('node:module');
                if (isBuiltin(module)) {
                    try {
                        v = br(module);
                        return MaybePromise(v);
                    }
                    catch (e) {
                        this.log('GET_MODULE', { module, type: 'SYNC', import_used: 'builtin', error: e }, 'error');
                    }
                }
                try {
                    const resolved = br.resolve(module, { paths: [process.cwd()] });
                    if (fs.existsSync(resolved)) {
                        v = br(resolved);
                        return MaybePromise(v);
                    }
                }
                catch (e) {
                    this.log('GET_MODULE', { module, type: 'SYNC', import_used: 'cwd_resolve', error: e }, 'error');
                }
            }
            this.log('GET_MODULE', { note: 'SYNC PATHS EXHAUSTED — ENTERING ASYNC LAST RESORT', module, type: 'SYNC' }, 'success');
            if (module)
                return Promise.resolve().then(() => MAELSTROM.blindImport(module));
        }
        catch (e) {
            this.log('GET_MODULE', { module, type: 'SYNC', error: e }, 'error');
        }
        return undefined;
    }
    is_require_available() { return MAELSTROM.blindRequire !== null; }
    normalizeFallback(fallback, fallbackDefault) {
        if (typeof fallback === 'function')
            return fallback;
        if (fallback !== undefined)
            return () => fallback;
        return fallbackDefault;
    } /** the safe proxy — missing module access is suppressed, never crashed */
    createSafeProxy = () => new Proxy(function noop() { }, {
        get: (_, prop) => {
            if (prop === Symbol.toPrimitive) {
                this.log('SAFE_PROXY', { note: `Missing module. Suppressed access to: ${String(prop)}` }, 'warn');
                return () => '';
            }
            if (prop === 'valueOf' || prop === 'toString') {
                this.log('SAFE_PROXY', { note: `Missing module. Suppressed access to: ${String(prop)}` }, 'warn');
                return () => '[MAELSTROM:missing-module]';
            }
            if (prop === 'then' || prop === Symbol.iterator)
                return undefined;
            const noop = () => { };
            return new Proxy(noop, {
                get: () => noop,
                apply: () => this.createSafeProxy(),
                construct: () => this.createSafeProxy(),
            });
        },
        apply: () => this.createSafeProxy(),
        construct: () => this.createSafeProxy(),
    });
    toNamespace(m) {
        if (m && typeof m === 'object')
            return m;
        return { default: m };
    }
    extractNamed(ns, comp_name) {
        const n = this.toNamespace(ns);
        return n[comp_name] ?? n.default?.[comp_name];
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // THE REGISTRY — every solver reads and writes through here, and nowhere else
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    rf(k) { return `${k}_RIFTS_`; }
    make(name, store = 'local') {
        if (store === 'cloud')
            return new CloudRift(name);
        if (store === 'auto') {
            if (this.autoCloud === undefined)
                this.autoCloud = this.detectCloudSupport();
            return (this.autoCloud ? new CloudRift(name) : new Rift());
        }
        return new Rift();
    } /** true when a shared store can actually round-trip */
    detectCloudSupport() {
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        return !!(g.window && g.window !== g) || typeof g.document !== 'undefined';
    }
    get(name, store = 'local') {
        if (!this.rifts.has(name))
            this.rifts.set(name, this.make(name, store));
        return this.rifts.get(name);
    }
    hasRift(name) { return this.rifts.has(name); }
    deleteRift(name) { return this.rifts.delete(name); }
    resetRift(name) { this.rifts.get(name)?.reset(); }
    clearRifts() { this.rifts.clear(); }
    get size() { return this.rifts.size; }
    inspect() {
        return [...this.rifts.entries()].map(([name, rift]) => ({
            name,
            isOpen: rift.isOpen,
            isClaimed: rift.isClaimed,
            createdAt: rift.createdAt,
            openedAt: rift.openedAt,
        }));
    } /** guard — wait for a rift, then run a fn on its unlock value */
    guard(name, fn, timeoutMs) {
        return (async () => {
            const val = await this.get(name).wait(timeoutMs);
            return fn(val);
        })();
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // THE SHARED RESULTS SURFACE — a view onto the ONE registry, not a second map
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    /**
     * Record an outcome. This is the single funnel: it tags the registry entry, notifies the
     * entry's subscribers, advances every waiter on the label, and releases deferred tasks.
     * It writes to the ONE registry — it creates no maps.
     */
    record(label, solver, value, store = 'local') {
        const rift = this.get(label, store);
        rift.solver = solver;
        rift.store = store;
        rift.version++;
        const rec = {
            label, solver, store, value,
            ok: value !== undefined && value !== null,
            openedAt: rift.openedAt ?? Date.now(),
        };
        rift.open(value); // the entry itself notifies its own subscribers
        this.get('__results__').reset(); // sentinel re-fires per record (open is idempotent)
        this.get('__results__').open(rec); // machine-level watchers ride the same mechanism
        this.releaseMultiWaiters(label, value);
        this.drainDefer(label);
    } /** the results view — computed from the ONE registry, stored nowhere */
    get results() {
        const out = [];
        for (const [label, rift] of this.rifts) {
            const r = rift;
            if (r.solver === undefined)
                continue;
            out.push({
                label,
                solver: r.solver,
                store: (r.store ?? 'local'),
                value: rift.current,
                ok: rift.current !== undefined && rift.current !== null,
                openedAt: rift.openedAt ?? rift.createdAt,
            });
        }
        return out;
    }
    result(label) {
        const rift = this.rifts.get(label);
        if (!rift || rift.solver === undefined)
            return undefined;
        return {
            label,
            solver: rift.solver,
            store: (rift.store ?? 'local'),
            value: rift.current,
            ok: rift.current !== undefined && rift.current !== null,
            openedAt: rift.openedAt ?? rift.createdAt,
        };
    }
    resultsFrom(solver) {
        return this.results.filter((r) => r.solver === solver);
    } /** "any result, any solver" — rides the ONE mechanism: the sentinel entry's own subscription */
    onResult(listener) {
        return this.get('__results__').onOpen(() => listener(this.result('__results__')));
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · get / place — the plain registry read and write
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    read(label, store = 'local') {
        const rift = this.get(label, store);
        const v = rift.current;
        this.record(label, 'get', v, store);
        return v;
    }
    get_value(label) { return this.read(label); }
    place(label, value, store = 'local') {
        this.get(label, store).open(value);
        this.record(label, 'place', value, store);
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · smash_n_grab — the bandit. Never throws, always returns a usable envelope.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    smash_n_grab(label, module, wait, store = 'local') {
        let v;
        try {
            v = this.get(label, store);
            if (v.isOpen) { // check rift registry, return current
                try {
                    return MaybePromise({ is_waiting: false, isLoaded: true, get: v.current });
                }
                catch (e) {
                    this.log('SMASH_N_GRAB', { msg: '[CHECK RIFT REG, RETURN CURRENT][FAILED][MOVING ON...]', error: e }, 'error');
                }
            }
            if (!module && wait) { // no module but a wait → wait for it
                try {
                    this.log('SMASH_N_GRAB', { msg: '[NO MODULE BUT WAIT SUPPLIED — WAITING]' }, 'info');
                    const raw = v.wait(wait);
                    const envelope = (w) => MaybePromise({ is_waiting: !w, isLoaded: module ? this.hasRift(module) : false, mod: w });
                    if (raw instanceof Promise) { // a rejected wait is a miss, not a crash
                        return MaybePromise(raw.then((w) => envelope(w), (e) => { this.log('SMASH_N_GRAB', { msg: '[WAIT TIMED OUT — RETURNING MISS]', error: e }, 'warn'); return envelope(undefined); }));
                    }
                    return envelope(raw);
                }
                catch (e) {
                    this.log('SMASH_N_GRAB', { msg: '[WAIT PATH FAILED][MOVING ON...]', error: e }, 'error');
                }
            }
            if (label && module && !wait) { // label + module, no wait → open
                try {
                    return MaybePromise({ is_waiting: false, isLoaded: true, mod: v.open(module) });
                }
                catch (e) { // all else fails — nuke it
                    const value = this.get_module(module);
                    this.log('SMASH_N_GRAB', { msg: 'try failed, attempting catch gate now...', error: e }, 'error');
                    v.open(value);
                    this.record(label, 'smash_n_grab', value, store);
                    return MaybePromise({ is_waiting: false, isLoaded: true, mod: value });
                }
            }
        }
        catch (e) {
            this.log('SMASH_N_GRAB', { error: e }, 'error');
        }
        const ap = this.apparation.func();
        return MaybePromise({ is_waiting: false, isLoaded: false, mod: ap });
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · create_rift — the founder
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    create_rift(label, module, store = 'local') {
        try {
            if (module) {
                this.get(label, store).open(module);
                this.record(label, 'create_rift', module, store);
                return MaybePromise(module);
            }
        }
        catch (e) {
            const value = this.get_module(module);
            if (value && !(value instanceof Promise)) {
                this.get(label, store).open(value);
                this.record(label, 'create_rift', value, store);
                return MaybePromise(value);
            }
            this.log('CREATE_RIFT', { error: e, msg: 'try failed, attempting catch gate now...' }, 'error');
        }
        return undefined;
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · use_rift — the traveler. The full resolution ladder.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    use_rift(label, wait, apparation, store = 'local') {
        try {
            const rift = this.get(label, store);
            if (rift.isOpen) {
                this.record(label, 'use_rift', rift.current, store);
                return MaybePromise(rift.current);
            }
            if (rift.isClaimed) {
                try {
                    return MaybePromise(rift.wait(wait));
                }
                catch (e) {
                    this.log('USE_RIFT', { msg: 'try failed...', error: e }, 'error');
                }
            }
            const value = this.get_module(label);
            if (value && !(value instanceof Promise)) {
                rift.open(value);
                this.record(label, 'use_rift', value, store);
                return MaybePromise(value);
            }
            this.record(label, 'use_rift', apparation, store);
            return apparation;
        }
        catch (e) {
            this.log('USE_RIFT', { error: e }, 'error');
            return apparation;
        }
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · resolve_global_rift / resolve_rift_initial — the diplomat and the bootstrap
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    resolve_global_rift(name, wait = 20000, fallback) {
        try {
            const rift = this.get(name);
            if (rift.isOpen)
                return rift.current;
            if (rift.isClaimed) {
                try {
                    return MaybePromise(rift.wait(wait));
                }
                catch (e) {
                    this.log('RESOLVE_GLOBAL_RIFT', { error: e }, 'error');
                    return fallback;
                }
            }
            return fallback;
        }
        catch (e) {
            this.log('RESOLVE_GLOBAL_RIFT', { error: e }, 'error');
            return fallback;
        }
    }
    resolve_rift_initial(name, v) {
        try {
            return this.resolve_global_rift(name, 15000, v);
        }
        catch (e) {
            this.log('RESOLVE_RIFT_INITIAL', { error: e }, 'error');
            return e?.error ?? v;
        }
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · has — the scout. Four probes, one boolean.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    has(module) {
        if (this.hasRift(module))
            return true;
        if (this.isLoaded(module))
            return true;
        if (this.get(module).isOpen)
            return true;
        try {
            MAELSTROM.blindRequire(module);
            return true;
        }
        catch {
            try {
                void MAELSTROM.blindImport(module);
                return true;
            }
            catch {
                return false;
            }
        }
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · probe + use_if_available — the locally sourced named import
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    //
    // Cold path: returns `fallback` synchronously. ZERO await. ZERO promise.
    // One probe per label, ever — every later call is a bare property read.
    // The background import resolves the rift; every subsequent call sees the real value.
    probe(label, filePath, comp_name, fallback) {
        return this.use_if_available(label, filePath, comp_name, fallback);
    } /**
     * The named-export form of use(). `label` is the rift key — one probe per name, ever.
     * `filePath` resolves relative to this file (the "locally sourced" anchor).
     * Cold: sync fallback. Hot: the real named export, as a plain property read.
     */
    use_if_available(label, filePath, comp_name, fallback, opts) {
        const rift = this.get(label, opts?.store ?? 'local');
        if (rift.isOpen)
            return rift.current; // hot path — done, sync
        if (rift.claim()) { // one-time fire-and-forget probe
            void (async () => {
                try {
                    const mod = await MAELSTROM.blindImport(this.key_for(filePath));
                    const named = mod?.[comp_name] !== undefined ? mod[comp_name] : fallback;
                    rift.open(named);
                    this.record(label, 'use_if_available', named, opts?.store ?? 'local');
                }
                catch {
                    rift.open(fallback);
                    this.record(label, 'use_if_available', fallback, opts?.store ?? 'local');
                }
            })();
        }
        return fallback; // cold path — instant
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · conjure — the conjurer. The full cached/uncached pair.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    /** cached conjuration — one registry entry per moduleName, claimed once, waited on forever after */
    conjure(options) {
        const { moduleName, fallback: rawFallback, module = true, cache = true, preferRequire = false, importPromise, ...userEnvImports } = options;
        const fallback = this.normalizeFallback(rawFallback, this.createSafeProxy);
        if (!moduleName || !cache) {
            return this.conjure_uncached({ moduleName, fallback: fallback(), module, preferRequire, importPromise, ...userEnvImports });
        }
        const rift = this.get(moduleName);
        if (rift.isOpen)
            return rift.wait();
        if (!rift.claim())
            return rift.wait();
        const result = this.conjure_uncached({ moduleName, fallback, module, preferRequire, importPromise, ...userEnvImports });
        const settle = (resolved) => { rift.open(resolved); this.record(moduleName, 'conjure', resolved); return resolved; };
        return MaybePromise(result instanceof Promise ? result.then(settle) : settle(result));
    } /** the agnostic auto importer: if it doesn't exist, it doesn't crash */
    conjure_uncached(options) {
        const { moduleName, fallback: rawFallback, comp_name, module = true, preferRequire = false, importPromise, force, ...userEnvImports } = options;
        const fallback = this.normalizeFallback(rawFallback, this.createSafeProxy);
        const forceNode = force !== undefined;
        const state = this.ENV_STATE;
        const priorityKeys = state.ready
            ? [...state.adapters, ...state.compilers, state.moduleLevel, state.platform, state.bundler]
            : [];
        let syncResult = undefined;
        let needsAsync = false;
        if (!module || (importPromise && !moduleName)) {
            if (importPromise && typeof importPromise?.then !== 'function') {
                syncResult = importPromise;
            }
            else if (importPromise) {
                needsAsync = true;
            }
            else {
                for (const value of Object.values(userEnvImports)) {
                    if (value && typeof value === 'object' && typeof value.then === 'function') {
                        needsAsync = true;
                        break;
                    }
                    if (value !== null && value !== undefined) {
                        syncResult = value;
                        break;
                    }
                }
                if (!needsAsync && syncResult === undefined)
                    syncResult = fallback();
            }
        }
        else {
            for (const key of priorityKeys) {
                if (key && userEnvImports[key]) {
                    const v = userEnvImports[key];
                    if (v && typeof v === 'object' && typeof v.then === 'function') {
                        needsAsync = true;
                        break;
                    }
                    if (v !== null && v !== undefined) {
                        syncResult = v;
                        break;
                    }
                }
            }
            if (!needsAsync && syncResult === undefined && userEnvImports.default) {
                const v = userEnvImports.default;
                if (v && typeof v === 'object' && typeof v.then === 'function')
                    needsAsync = true;
                else if (v !== null && v !== undefined)
                    syncResult = v;
            }
            if (!needsAsync && syncResult === undefined && moduleName) {
                if (forceNode) {
                    try {
                        const res = typeof force === 'function' ? force() : force;
                        if (res !== null && res !== undefined)
                            syncResult = res;
                        else
                            needsAsync = true;
                    }
                    catch {
                        needsAsync = true;
                    }
                }
                else if (comp_name) {
                    if (this.is_require_available()) {
                        try {
                            const res = MAELSTROM.blindRequire(moduleName);
                            if (res && res[comp_name] !== undefined)
                                syncResult = res[comp_name];
                            else
                                needsAsync = true;
                        }
                        catch {
                            needsAsync = true;
                        }
                    }
                    else
                        needsAsync = true;
                }
                else if (preferRequire && MAELSTROM.blindRequire) {
                    try {
                        const res = MAELSTROM.blindRequire(moduleName);
                        if (res !== null && res !== undefined)
                            syncResult = res;
                        else
                            needsAsync = true;
                    }
                    catch {
                        needsAsync = true;
                    }
                }
                else if (this.is_require_available() && MAELSTROM.blindRequire) {
                    try {
                        const res = MAELSTROM.blindRequire(moduleName);
                        if (res !== null && res !== undefined)
                            syncResult = res;
                        else
                            needsAsync = true;
                    }
                    catch {
                        needsAsync = true;
                    }
                }
                else
                    needsAsync = true;
            }
            if (!needsAsync && syncResult === undefined)
                syncResult = fallback();
        }
        if (syncResult)
            return MaybePromise(syncResult);
        // async last resort — promise-driven with a 10s opt-out
        return MaybePromise(new Promise((resolve, reject) => {
            let timer;
            const done = (v) => { if (timer)
                clearTimeout(timer); this.record(moduleName ?? '(anon)', 'conjure', v); resolve(v); };
            if (!module || (importPromise && !moduleName)) {
                if (importPromise) {
                    done(importPromise);
                    return;
                }
                for (const value of Object.values(userEnvImports)) {
                    if (value && typeof value === 'object' && typeof value.then === 'function') {
                        done(value);
                        return;
                    }
                }
            }
            if (moduleName) {
                if (comp_name) {
                    MAELSTROM.blindImport(moduleName).then((res) => {
                        if (res && res[comp_name] !== undefined)
                            done(res[comp_name]);
                        else
                            done(fallback());
                    }).catch(() => done(fallback()));
                    return;
                }
                MAELSTROM.blindImport(moduleName).then((res) => {
                    if (res !== null && res !== undefined)
                        done(res);
                    else
                        done(fallback());
                }).catch(() => done(fallback()));
                return;
            }
            if (userEnvImports.default) {
                done(userEnvImports.default);
                return;
            }
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(() => reject(new Error(`[rift] wait() timed out after 10000ms`)), 10000);
        }));
    } /** conjure a rift for a whole module namespace */
    conjure_lib_rift(label, cache = true, module = true) {
        const rift = this.get(label);
        if (rift.isOpen)
            return rift;
        const raw = this.conjure({ moduleName: label, module, cache });
        const result = MaybePromise(raw);
        const resolve = (resolved) => {
            if (resolved === undefined || resolved === null)
                return resolved;
            rift.open(resolved);
            this.record(label, 'conjure', resolved);
            return resolved?.[label];
        };
        return MaybePromise(result instanceof Promise ? result.then(resolve) : resolve(result));
    } /** conjure a rift for a single named export */
    conjure_named_lib_rift(label, comp_name, cache = true, module = true) {
        const rift = this.get(label);
        if (rift.isOpen)
            return rift;
        const raw = this.conjure({ moduleName: label, module, cache, comp_name });
        const result = MaybePromise(raw);
        const resolve = (resolved) => {
            if (resolved === undefined || resolved === null) {
                this.log('CONJURE_NAMED', { msg: 'module_not_found', label }, 'warn');
                return resolved;
            }
            if (typeof resolved !== 'object' || !(comp_name in resolved)) {
                this.log('CONJURE_NAMED', { msg: 'export_not_found', label, comp_name }, 'warn');
                return resolved;
            }
            rift.open(resolved);
            this.record(label, 'conjure', resolved);
            return resolved[comp_name];
        };
        return MaybePromise(result instanceof Promise ? result.then(resolve) : resolve(result));
    } /** init-level conjuration: the module itself, no default candidate, no string leak */
    conjure_lib_init(label, module = true) {
        return this.conjure_uncached({ moduleName: label, module });
    }
    conjure_named_lib_init(label, comp_name, module = true) {
        return this.conjure_uncached({ moduleName: label, module, comp_name });
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · check — the verifier. One probe per module, ever. Boolean out.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    async check(moduleName) {
        const label = `check:${moduleName}`;
        const rift = this.get(label);
        if (rift.claim()) {
            // check does the ONLY importing anywhere in this flow; open() just records the outcome
            (async () => {
                const result = await this.conjure_uncached({ moduleName, fallback: () => null });
                const ok = result != null;
                rift.open(ok);
                this.record(label, 'check', ok);
            })();
        }
        return rift.wait();
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · load_module / require_module / export_of — the porters and the index clerk
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    //
    // The module cache IS the registry: loaded modules live under `mod:` labels, sync-required
    // ones under `req:` labels, with the export index stored ON the entry itself. Inflight
    // dedupe lives on the entry too. No separate maps.
    isLoaded(specifier) { return this.get(`mod:${this.key_for(specifier)}`).isOpen; }
    getLoaded(specifier) { return this.get(`mod:${this.key_for(specifier)}`).current; }
    /**
     * Find a named export across every loaded module.
     * Ambiguous finds throw — the index never silently guesses.
     */
    export_of(name, specifier) {
        if (specifier !== undefined)
            return this.getLoaded(specifier)?.[name];
        const sources = new Map();
        for (const [label, rift] of this.rifts) {
            if (!label.startsWith('mod:') || !rift.isOpen)
                continue;
            const idx = rift.exports;
            const found = idx?.get(name);
            if (found)
                for (const [k, v] of found)
                    sources.set(k, v);
        }
        if (sources.size === 0)
            return undefined;
        if (sources.size > 1)
            throw new Error(`Ambiguous export "${name}" found in: ${[...sources.keys()].join(', ')}`);
        return sources.values().next().value;
    }
    indexExports(rift, key, mod) {
        if (!mod || (typeof mod !== 'object' && typeof mod !== 'function'))
            return;
        for (const name of Object.keys(mod)) {
            let sources = rift.exports.get(name);
            if (!sources) {
                sources = new Map();
                rift.exports.set(name, sources);
            }
            sources.set(key, mod[name]);
        }
    } /** async load with inflight dedupe — same key always resolves to the same promise */
    load_module(specifier) {
        const key = this.key_for(specifier);
        const rift = this.get(`mod:${key}`);
        if (rift.isOpen)
            return Promise.resolve(rift.current);
        if (rift.inflight)
            return rift.inflight;
        const p = MAELSTROM.blindImport(key).then((mod) => {
            rift.open(mod);
            this.indexExports(rift, key, mod);
            rift.inflight = undefined;
            this.record(`mod:${key}`, 'load_module', mod);
            return mod;
        }).catch((err) => {
            rift.inflight = undefined; // let it retry later
            throw err;
        });
        rift.inflight = p;
        return p;
    } /** the porter's sync twin — blind require, cached, indexed */
    require_module(specifier) {
        const rift = this.get(`req:${specifier}`);
        if (rift.isOpen)
            return rift.current;
        if (!MAELSTROM.blindRequire) { // ESM / browser — no require, no crash
            this.log('REQUIRE_MODULE', { msg: 'require unavailable in this module system — returning undefined', specifier }, 'warn');
            return undefined;
        }
        const mod = MAELSTROM.blindRequire(specifier);
        rift.open(mod);
        this.indexExports(rift, specifier, mod);
        this.record(`req:${specifier}`, 'require_module', mod);
        return mod;
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · wait_for / signal — the signal waiter. ONE list.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    /**
     * register a waiter over one or more signal keys; fires when ALL of them have fired.
     * ONE label → the waiter IS an entry subscription (Rift.onOpen). No parallel list.
     * MANY labels → one row in the multi-waiter table, released by each entry's own
     * subscription firing. Every subscribe call goes through the entry, always.
     */
    wait_for(deps, fn) {
        const keys = [...new Set(Array.isArray(deps) ? deps : [deps])];
        const id = ++this.nextWaiterId;
        if (keys.length === 1) { // single-label → pure subscription
            const unsubs = [];
            const rift = this.get(keys[0]);
            if (rift.isOpen) {
                fn(rift.current);
                return id;
            }
            unsubs.push(rift.onOpen((v) => { fn(v); }));
            return id;
        }
        const entry = { id, deps: keys, fn, ready: new Set() }; // multi-label → one table row
        this.multiWaiters.add(entry);
        for (const k of keys) {
            const rift = this.get(k);
            if (rift.isOpen)
                entry.ready.add(k);
            else
                rift.onOpen((v) => this.releaseMultiWaiters(k, v));
        }
        if (entry.ready.size === keys.length) {
            fn();
            this.multiWaiters.delete(entry);
        }
        return id;
    } /** advance every multi-label waiter on this label */
    releaseMultiWaiters(k, v) {
        for (const entry of [...this.multiWaiters]) {
            if (!entry.deps.includes(k))
                continue;
            entry.ready.add(k);
            if (entry.ready.size !== entry.deps.length)
                continue;
            this.multiWaiters.delete(entry);
            try {
                entry.fn(v);
            }
            catch (e) {
                queueMicrotask(() => { throw e; });
            }
        }
    }
    cancel_wait(id) {
        for (const entry of this.multiWaiters) {
            if (entry.id !== id)
                continue;
            this.multiWaiters.delete(entry);
            return true;
        }
        return false;
    } /** rift-shaped wait on a single label — subscribe first, then re-check isOpen */
    wait_and_promise(timeoutMs, key, isOpen, current) {
        const rift = this.get(key);
        return new Promise((resolve, reject) => {
            // subscribe first, THEN re-check isOpen — closes the gap where the record opens mid-subscribe
            let timer;
            const unsub = rift.onOpen((v) => {
                if (timer)
                    clearTimeout(timer);
                unsub();
                this.record(key, 'wait_for', v);
                resolve(v);
            });
            if (isOpen) { // opened while we were subscribing
                if (timer)
                    clearTimeout(timer);
                unsub();
                this.record(key, 'wait_for', current);
                resolve(current);
                return;
            }
            if (timeoutMs) {
                timer = setTimeout(() => {
                    unsub();
                    reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            }
        });
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · defer — the scheduler. Drain loop, versioned deps, stats, cancellation.
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    //
    // Deferred dependency values are registry entries — `provide` opens a rift under the
    // dependency's label. No separate dependency map. The task table holds tasks only.
    deferOnError = (e, id, deps) => {
        this.log('DEFERRED', { msg: 'Task failed', id, deps, error: e }, 'error');
    };
    deferOnSuccess = (id, deps) => {
        this.log('DEFERRED', { msg: 'Task fulfilled', id, deps }, 'info');
    }; /** register work. Executes immediately if every dependency is ready. */
    defer(deps, fn) {
        const keys = [...new Set(typeof deps === 'string' ? [deps] : deps)];
        const id = ++this.nextDeferId;
        this.deferStats.registered++;
        this.deferTasks.set(id, { id, deps: keys, fn, state: 'pending' });
        this.drain();
        return id;
    } /** publish or replace a dependency's value — this is place() with version churn */
    provide(k, v) {
        const entries = typeof k === 'string' ? [[k, v]] : Object.entries(k);
        for (const [key, value] of entries) {
            const rift = this.get(key);
            rift.reset(); // replace, don't just first-open
            rift.open(value);
            rift.version++;
            this.record(key, 'manual', value);
        }
        this.drain();
    } /** mark a dependency as available without a meaningful value */
    resolve(k) { this.provide(k, undefined); }
    /** revoke availability. Already-dispatched work is unaffected. */
    invalidate(k) { return this.deleteRift(k); }
    deferHas(k) { return this.get(k).isOpen; }
    deferGet(k) { return this.get(k).current; }
    cancel(id) {
        const task = this.deferTasks.get(id);
        if (!task || task.state !== 'pending')
            return false;
        this.deferTasks.delete(id);
        this.deferStats.cancelled++;
        return true;
    }
    deferReady(task) { return task.deps.every((k) => this.get(k).isOpen); }
    drain() {
        if (this.draining) {
            this.drainAgain = true;
            return;
        }
        this.draining = true;
        try {
            do {
                this.drainAgain = false;
                for (const task of this.deferTasks.values()) {
                    if (task.state !== 'pending' || !this.deferReady(task))
                        continue;
                    task.state = 'running'; // claim before execution to prevent duplicate dispatch
                    this.deferStats.executed++;
                    const v = task.deps.map((k) => this.get(k).current);
                    try {
                        const result = task.fn(...v);
                        if (result != null && typeof result.then === 'function') {
                            Promise.resolve(result).then(() => {
                                this.deferStats.completed++;
                                this.deferOnSuccess(task.id, task.deps);
                            }).catch((e) => {
                                this.deferStats.failed++;
                                this.reportDeferError(task, e);
                            }).finally(() => { this.deferTasks.delete(task.id); });
                        }
                        else {
                            this.deferStats.completed++;
                            this.deferOnSuccess(task.id, task.deps);
                            this.deferTasks.delete(task.id);
                        }
                    }
                    catch (e) {
                        this.deferStats.failed++;
                        this.reportDeferError(task, e);
                        this.deferTasks.delete(task.id);
                    }
                }
            } while (this.drainAgain);
        }
        finally {
            this.draining = false;
        }
    } /** a recorded result releases any deferred task waiting on it */
    drainDefer(label) {
        this.drain();
    }
    reportDeferError(task, e) {
        try {
            this.deferOnError(e, task.id, task.deps);
        }
        catch { /* error reporting must not interrupt the scheduler */ }
    }
    deferInspect() {
        const pending = [...this.deferTasks.values()].filter((x) => x.state === 'pending').map((x) => ({ id: x.id, deps: x.deps, missing: x.deps.filter((k) => !this.get(k).isOpen) }));
        const running = [...this.deferTasks.values()].filter((x) => x.state === 'running').map((x) => ({ id: x.id, deps: x.deps }));
        return {
            stats: { ...this.deferStats },
            pending,
            running,
        };
    }
    deferClear() {
        for (const [id, task] of this.deferTasks) {
            if (task.state === 'pending') {
                this.deferTasks.delete(id);
                this.deferStats.cancelled++;
            }
        }
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // SOLVER · detect_environment — the cartographer
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    static MODULE_LEVEL_CANDIDATES = [
        'typescript', 'rollup', 'vite', 'eslint', 'babel', 'postcss', 'tailwindcss',
        '@babel/core', 'prettier', 'stylelint', 'sass', 'less', 'jest', 'vitest',
        'playwright', '@types/vscode',
    ];
    static PLATFORM_CANDIDATES = [
        'PROJECT_PLATFORM_KILLER', 'react', 'preact', '@remix-run/react', '@react-router/react',
        'next', 'nuxt', 'svelte', 'solid', 'vite', 'arfa', 'vue', 'angular', 'astro',
        'gatsby', 'dojo', 'inferno', 'lupine', 'ember-source', 'backbone', 'alpinejs',
        'lit', 'marko', '@builder.io/qwik', 'solid-start', '@sveltejs/kit', 'meteor',
        'stencil', 'aurelia', 'nodiff', 'qwik', 'velo-type', 'webpack',
    ];
    static COMPILER_CANDIDATES = [
        'rspack', 'webpack', 'vite', 'rollup', 'esbuild', 'swc-loader', 'babel', 'next',
        'nuxt', '@remix-run/react', '@react-router/react', 'svelte', 'solid', 'vue',
        '@swc/core', 'turbopack', 'parcel', 'tsup', 'unbuild', 'esbuild-loader',
        '@babel/core', 'terser', '@angular/core', '@angular/compile',
    ];
    static BUNDLER_CANDIDATES = ['bun', 'pnpm', 'yarn', 'npm'];
    static ADAPTER_CANDIDATES = [
        'websocket_dev_server', 'cross_app_ws_server', 'terminal_ngin_proxy_register',
        'terminal_ngin_proxy', 'workspace_hub_server', 'workspace_hub_client',
        'cross_app_ws_client', 'cse_cross_app_server', 'cse_cross_app_client',
        'shared_worker', 'service_worker', 'unix_worker', 'broadcastr_channel',
        'websocket', 'websocket_server', 'websocket_client', 'webrtc', 'webrtc_server',
        'webrtc_client', 'electron_server', 'electron_client', 'mqtt', 'sse',
        'named_pipe', 'worker_thread', 'native_msg_host', 'native_msg_client',
    ];
    static CAPABILITY_CANDIDATES = [
        'shared_worker', 'service_worker', 'unix_worker', 'broadcastr_channel',
        'electron_server', 'electron_client', 'named_pipe', 'native_msg_host', 'native_msg_client',
    ];
    detectCapability(name) {
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        switch (name) {
            case 'shared_worker': return typeof g.SharedWorker !== 'undefined';
            case 'service_worker': return typeof g.ServiceWorkerGlobalScope !== 'undefined' || (typeof g.navigator !== 'undefined' && 'serviceWorker' in g.navigator);
            case 'unix_worker': return typeof g.process !== 'undefined' && !!g.process?.versions?.node;
            case 'broadcastr_channel': return typeof g.BroadcastChannel !== 'undefined';
            case 'electron_server':
            case 'electron_client': return typeof g.process !== 'undefined' && !!g.process?.versions?.electron;
            case 'named_pipe':
            case 'native_msg_host':
            case 'native_msg_client': return typeof g.process !== 'undefined' && !!g.process?.versions?.node;
            default: return false;
        }
    }
    detectBundler() {
        const proc = typeof process !== 'undefined' ? process : null;
        if (!proc || !proc.versions?.node)
            return null; // .versions check distinguishes real Node from a browser shim
        if (proc.versions?.bun)
            return 'bun';
        const ua = proc.env?.npm_config_user_agent ?? '';
        if (ua.startsWith('pnpm'))
            return 'pnpm';
        if (ua.startsWith('yarn'))
            return 'yarn';
        if (ua.startsWith('npm'))
            return 'npm';
        return null;
    }
    async detectFirstMatch(candidates) {
        for (const name of candidates) {
            if (await this.check(name))
                return name;
        }
        return null;
    }
    async detectAll(candidates) {
        const results = await Promise.all(candidates.map(async (name) => ((await this.check(name)) ? name : null)));
        return results.filter((r) => r !== null);
    } /** runs once. Everything downstream just reads the result. */
    detect_environment(env_lib) {
        void (async () => {
            const bundler = this.detectBundler();
            const [moduleLevel, platform, compilers, adapters] = await Promise.all([
                this.detectFirstMatch(env_lib ? [env_lib] : MAELSTROM.MODULE_LEVEL_CANDIDATES),
                this.detectFirstMatch(MAELSTROM.PLATFORM_CANDIDATES),
                this.detectAll(MAELSTROM.COMPILER_CANDIDATES),
                this.detectAll(MAELSTROM.ADAPTER_CANDIDATES),
            ]);
            this.ENV_STATE = { moduleLevel, platform, compilers, bundler, adapters, ready: true };
            this.record('ENV_DETECTION', 'detect_environment', this.ENV_STATE);
        })();
    } /** pure read — no imports, no re-checking, ever */
    useEnvState() {
        if (!this.ENV_STATE.ready && !this.warnedUseBeforeReady) {
            this.warnedUseBeforeReady = true; // warn once, not spam
            this.log('USE_ENV_STATE', { note: 'called before detect_environment() finished — falling back to defaults' }, 'warn');
        }
        return { ...this.ENV_STATE, rt: 'ENV_DETECTION', subChannel: '[CSE_ENV]' };
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // APPARATION — the no-op factory, carried whole
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    apparation = {
        any: () => ({}),
        anyGeneric: () => ({}),
        anyProp: (v) => v,
        anyProp2: (v) => v,
        anyProp3: (v) => v,
        anyAs: (v) => v,
        promise: () => Promise.resolve({}),
        booleanPromise: () => Promise.resolve(false),
        void: () => { },
        func: () => () => ({}),
        funcVoid: () => () => { },
        universal: () => new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol')
                    return undefined;
                const propName = prop;
                if (propName === 'then' || propName === 'catch' || propName === 'finally')
                    return undefined;
                if (propName === Symbol.iterator)
                    return function* () { };
                if (propName === 'toString' || propName === 'valueOf')
                    return () => '';
                return (...args) => target;
            },
            set: () => true,
            deleteProperty: () => true,
            ownKeys: () => [],
            getOwnPropertyDescriptor: () => undefined,
            apply: (target) => target,
            construct: (target) => target,
        }),
        universalNoop: () => new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol')
                    return undefined;
                const propName = prop;
                if (propName === 'then' || propName === 'catch' || propName === 'finally')
                    return undefined;
                if (propName === Symbol.iterator)
                    return function* () { };
                if (propName === 'toString' || propName === 'valueOf')
                    return () => '';
                return (...args) => target;
            },
            set: () => true,
            deleteProperty: () => true,
            ownKeys: () => [],
            getOwnPropertyDescriptor: () => undefined,
            apply: (target) => target,
            construct: (target) => target,
        }),
        simpleNoop: () => ({}),
        noopPromise: () => Promise.resolve({}),
        noopBooleanPromise: () => Promise.resolve(false),
        noopVoid: () => { },
        noopFunction: () => () => ({}),
        thenable: () => ({ then: (_onF, _onR) => new Promise(() => { }) }),
        asyncIterable: () => ({ [Symbol.asyncIterator]: async function* () { await new Promise(() => { }); } }),
        null: () => null,
        primitive: () => undefined,
        string: () => '',
        number: () => 0,
        boolean: () => false,
        bigint: () => 0n,
        symbol: () => Symbol('apparation'),
        undefined: () => undefined,
        undefinedString: () => 'undefined',
        function_: () => () => { },
        typedArray: () => new Uint8Array(),
        dataView: () => new DataView(new ArrayBuffer(0)),
        arrayBuffer: () => new ArrayBuffer(0),
        map: () => new Map(),
        set: () => new Set(),
        date: () => new Date(0),
        regexp: () => /(?:)/,
        error: (msg = '[Apparation]') => new Error(msg),
        iterable: () => [],
        iterator: () => [][Symbol.iterator](),
        object: () => ({}),
        plainObject: () => ({}),
        array: () => [],
        weakMap: () => new WeakMap(),
        weakSet: () => new WeakSet(),
        promiseInstance: () => Promise.resolve({}),
        url: () => new URL('about:blank'),
        urlSearchParams: () => new URLSearchParams(),
        buffer: () => (typeof Buffer !== 'undefined' ? Buffer.alloc(0) : new Uint8Array()),
        _ArrayBuffer: () => new Uint8Array(),
    };
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    // what_is_this_item_exactly — the type interrogator, carried whole
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    what_is_this_item_exactly(v) {
        // axis 2 first: is it async? — thenable (promise-like, not necessarily Promise)
        if (v != null && typeof v.then === 'function')
            return 'thenable';
        // async iterable
        if (v != null && typeof v[Symbol.asyncIterator] === 'function')
            return 'async-iterable';
        // axis 1: what shape?
        if (v === null)
            return 'null';
        const ty = typeof v;
        if (ty !== 'object' && ty !== 'function')
            return ty;
        if (typeof v === 'function')
            return 'function';
        if (ArrayBuffer.isView(v))
            return 'array';
        if (v instanceof Map)
            return 'map';
        if (v instanceof Set)
            return 'set';
        if (v instanceof Date)
            return 'date';
        if (v instanceof RegExp)
            return 'regexp';
        if (v instanceof Error)
            return 'error';
        if (typeof v[Symbol.iterator] === 'function')
            return 'iterable';
        if (v instanceof Array)
            return 'Array';
        if (v instanceof WeakMap)
            return 'WeakMap';
        if (v instanceof WeakSet)
            return 'WeakSet';
        if (v instanceof Promise)
            return 'Promise';
        if (v instanceof ArrayBuffer)
            return 'ArrayBuffer';
        // node-specific
        if (typeof Buffer !== 'undefined' && v instanceof Buffer)
            return 'Buffer';
        if (typeof URL !== 'undefined' && v instanceof URL)
            return 'URL';
        if (typeof URLSearchParams !== 'undefined' && v instanceof URLSearchParams)
            return 'URLSearchParams';
        // plain object / record
        if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Map) && !(v instanceof Set))
            return 'plainObject';
        return undefined;
    } // ═══════════════════════════════════════════════════════════════════════════════════════════
    // RESET — wipe everything: the one registry, waiters, subs, scheduler, env state
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    reset() {
        this.rifts.clear();
        this.multiWaiters.clear();
        this.deferTasks.clear();
        this.deferStats = { registered: 0, executed: 0, completed: 0, failed: 0, cancelled: 0 };
        this.autoCloud = undefined;
        this.ENV_STATE = { moduleLevel: null, platform: null, compilers: [], bundler: null, adapters: [], ready: false };
    }
}
export const maelstrom = new MAELSTROM();
// #endregion ──────────────────────────────────────────────────────────────────────────────────
