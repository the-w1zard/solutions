declare class REACTIVE_STORE {
    private records;
    private listeners;
    get<T = A>(key: S): RiftRecord<T> | undefined;
    set<T = A>(key: S, record: RiftRecord<T>): void;
    sub<T = A>(key: S, fn: StoreListener<T>): () => V;
    delete(key: S): void;
    clear(): void;
    get size(): N;
}
export declare const STORE: REACTIVE_STORE;
declare class MAELSTROM {
    root: A;
    private rifts;
    private multiWaiters;
    private nextWaiterId;
    private deferTasks;
    private nextDeferId;
    private draining;
    private drainAgain;
    private deferStats;
    private autoCloud;
    private warnedUseBeforeReady;
    private ENV_STATE;
    private shout;
    constructor(root?: A);
    FULFIL_THIS_NOW(r: A): V;
    REFRESH_ROOT(): A;
    private RITUAL_OF_BINDING;
    private log; /** dynamic import with no static dependency — works in every module system */
    private static readonly blindImport;
    /** require with no static dependency — null where require does not exist (browser/ESM) */
    private static readonly blindRequire;
    private static readonly has_require;
    private static readonly hasNode;
    private static readonly hasBun;
    /** resolve a specifier relative to THIS file, always. Absolute out. */
    private key_for; /** does a local file exist, resolved from cwd — the has_local probe */
    private has_local; /**
     * get_module: require the specifier → local file read → builtin check → cwd-resolved
     * require → async import as the last resort. Every sync path is tried before anything
     * returns a promise.
     */
    private get_module;
    private is_require_available;
    private normalizeFallback; /** the safe proxy — missing module access is suppressed, never crashed */
    private createSafeProxy;
    private toNamespace;
    private extractNamed;
    rf(k: A): S;
    private make; /** true when a shared store can actually round-trip */
    private detectCloudSupport;
    get<T = A>(name: S, store?: StoreKind): RiftLike<T>;
    hasRift(name: S): B;
    deleteRift(name: S): B;
    resetRift(name: S): V;
    clearRifts(): V;
    get size(): N;
    inspect(): R; /** guard — wait for a rift, then run a fn on its unlock value */
    guard<T, RR>(name: S, fn: (unlockValue: T) => RR | Promise<RR>, timeoutMs?: N): Promise<RR>;
    /**
     * Record an outcome. This is the single funnel: it tags the registry entry, notifies the
     * entry's subscribers, advances every waiter on the label, and releases deferred tasks.
     * It writes to the ONE registry — it creates no maps.
     */
    private record; /** the results view — computed from the ONE registry, stored nowhere */
    get results(): RO<Array<ResultRecord>>;
    result<T = A>(label: S): ResultRecord<T> | undefined;
    resultsFrom(solver: Solver): ResultRecord[]; /** "any result, any solver" — rides the ONE mechanism: the sentinel entry's own subscription */
    onResult(listener: (r: ResultRecord) => V): () => V;
    read<T = A>(label: S, store?: StoreKind): T | undefined;
    get_value<T = A>(label: S): T | undefined;
    place<T = A>(label: S, value: T, store?: StoreKind): V;
    smash_n_grab<T = A>(label: S, module?: A, wait?: N, store?: StoreKind): A;
    create_rift<T = A>(label: S, module: T, store?: StoreKind): A;
    use_rift<T = A>(label: S, wait?: N, apparation?: T, store?: StoreKind): A;
    resolve_global_rift<T = A>(name: S, wait?: N, fallback?: T): A;
    resolve_rift_initial<T = A>(name: S, v: T): A;
    has(module: S): B;
    probe<T = A>(label: S, filePath: S, comp_name: S, fallback: T): T; /**
     * The named-export form of use(). `label` is the rift key — one probe per name, ever.
     * `filePath` resolves relative to this file (the "locally sourced" anchor).
     * Cold: sync fallback. Hot: the real named export, as a plain property read.
     */
    use_if_available<T = A>(label: S, filePath: S, comp_name: S, fallback: T, opts?: {
        store?: StoreKind;
    }): T;
    /** cached conjuration — one registry entry per moduleName, claimed once, waited on forever after */
    conjure<T = A, F = A>(options: OPTIONAL_IMPORT_OPTIONS<T, F>): A; /** the agnostic auto importer: if it doesn't exist, it doesn't crash */
    conjure_uncached<T = A, F = A>(options: OPTIONAL_IMPORT_OPTIONS<T, F>): A; /** conjure a rift for a whole module namespace */
    conjure_lib_rift<T = A>(label: S, cache?: B, module?: B): A; /** conjure a rift for a single named export */
    conjure_named_lib_rift<T = A>(label: S, comp_name: S, cache?: B, module?: B): A; /** init-level conjuration: the module itself, no default candidate, no string leak */
    conjure_lib_init(label: S, module?: B): A;
    conjure_named_lib_init<T = A>(label: S, comp_name: S, module?: B): A;
    check(moduleName: S): Promise<B>;
    isLoaded(specifier: S): B;
    getLoaded<T = A>(specifier: S): OPT<T>;
    /**
     * Find a named export across every loaded module.
     * Ambiguous finds throw — the index never silently guesses.
     */
    export_of<T = A>(name: S, specifier?: S): OPT<T>;
    private indexExports; /** async load with inflight dedupe — same key always resolves to the same promise */
    load_module<T = A>(specifier: S): Promise<T>; /** the porter's sync twin — blind require, cached, indexed */
    require_module<T = A>(specifier: S): T;
    /**
     * register a waiter over one or more signal keys; fires when ALL of them have fired.
     * ONE label → the waiter IS an entry subscription (Rift.onOpen). No parallel list.
     * MANY labels → one row in the multi-waiter table, released by each entry's own
     * subscription firing. Every subscribe call goes through the entry, always.
     */
    wait_for(deps: S | S[], fn: (v?: A) => V): N; /** advance every multi-label waiter on this label */
    private releaseMultiWaiters;
    cancel_wait(id: N): B; /** rift-shaped wait on a single label — subscribe first, then re-check isOpen */
    wait_and_promise<T = A>(timeoutMs: N, key: S, isOpen: B, current: A): Promise<T>;
    private deferOnError;
    private deferOnSuccess; /** register work. Executes immediately if every dependency is ready. */
    defer(deps: S | S[], fn: (...v: A[]) => A): N; /** publish or replace a dependency's value — this is place() with version churn */
    provide(k: S, v: A): void;
    provide(deps: Record<S, A>): void;
    resolve(k: S): void;
    /** revoke availability. Already-dispatched work is unaffected. */
    invalidate(k: S): B;
    deferHas(k: S): B;
    deferGet<T = A>(k: S): OPT<T>;
    cancel(id: N): B;
    private deferReady;
    private drain; /** a recorded result releases any deferred task waiting on it */
    private drainDefer;
    private reportDeferError;
    deferInspect(): R;
    deferClear(): void;
    static readonly MODULE_LEVEL_CANDIDATES: readonly ["typescript", "rollup", "vite", "eslint", "babel", "postcss", "tailwindcss", "@babel/core", "prettier", "stylelint", "sass", "less", "jest", "vitest", "playwright", "@types/vscode"];
    static readonly PLATFORM_CANDIDATES: readonly ["PROJECT_PLATFORM_KILLER", "react", "preact", "@remix-run/react", "@react-router/react", "next", "nuxt", "svelte", "solid", "vite", "arfa", "vue", "angular", "astro", "gatsby", "dojo", "inferno", "lupine", "ember-source", "backbone", "alpinejs", "lit", "marko", "@builder.io/qwik", "solid-start", "@sveltejs/kit", "meteor", "stencil", "aurelia", "nodiff", "qwik", "velo-type", "webpack"];
    static readonly COMPILER_CANDIDATES: readonly ["rspack", "webpack", "vite", "rollup", "esbuild", "swc-loader", "babel", "next", "nuxt", "@remix-run/react", "@react-router/react", "svelte", "solid", "vue", "@swc/core", "turbopack", "parcel", "tsup", "unbuild", "esbuild-loader", "@babel/core", "terser", "@angular/core", "@angular/compile"];
    static readonly BUNDLER_CANDIDATES: readonly ["bun", "pnpm", "yarn", "npm"];
    static readonly ADAPTER_CANDIDATES: readonly ["websocket_dev_server", "cross_app_ws_server", "terminal_ngin_proxy_register", "terminal_ngin_proxy", "workspace_hub_server", "workspace_hub_client", "cross_app_ws_client", "cse_cross_app_server", "cse_cross_app_client", "shared_worker", "service_worker", "unix_worker", "broadcastr_channel", "websocket", "websocket_server", "websocket_client", "webrtc", "webrtc_server", "webrtc_client", "electron_server", "electron_client", "mqtt", "sse", "named_pipe", "worker_thread", "native_msg_host", "native_msg_client"];
    static readonly CAPABILITY_CANDIDATES: readonly ["shared_worker", "service_worker", "unix_worker", "broadcastr_channel", "electron_server", "electron_client", "named_pipe", "native_msg_host", "native_msg_client"];
    detectCapability(name: S): B;
    private detectBundler;
    private detectFirstMatch;
    private detectAll; /** runs once. Everything downstream just reads the result. */
    detect_environment(env_lib?: S): void; /** pure read — no imports, no re-checking, ever */
    useEnvState(): EnvDetectionState & {
        rt: S;
        subChannel: S;
    };
    apparation: A;
    what_is_this_item_exactly(v: U): S | undefined;
    reset(): void;
}
export declare const maelstrom: MAELSTROM;
interface RiftLike<T = A> {
    readonly isOpen: B;
    readonly isClaimed: B;
    readonly current: OPT<T>;
    readonly createdAt: N;
    readonly openedAt: OPT<N>;
    open(v?: T): V;
    reset(): V;
    claim(): B;
    wait(timeoutMs?: N): T | Promise<T>;
    onOpen(listener: (v: T) => V): () => V;
}
interface RiftRecord<T = A> {
    opened: B;
    claimed: B;
    value?: T;
    createdAt: N;
    openedAt?: N;
}
type StoreListener<T = A> = (v: RiftRecord<T>) => void;
type Solver = 'get' | 'place' | 'smash_n_grab' | 'create_rift' | 'use_rift' | 'resolve_global_rift' | 'resolve_rift_initial' | 'has' | 'probe' | 'use_if_available' | 'conjure' | 'check' | 'load_module' | 'require_module' | 'export_of' | 'wait_for' | 'defer' | 'detect_environment' | 'manual';
type StoreKind = 'local' | 'cloud' | 'auto';
interface ResultRecord<T = A> {
    label: S;
    solver: Solver;
    store: StoreKind;
    value: T | undefined;
    ok: B;
    openedAt: N;
}
interface OPTIONAL_IMPORT_OPTIONS<T = A, F = A> {
    moduleName?: S;
    fallback?: F | (() => F);
    module?: B;
    cache?: B;
    preferRequire?: B;
    importPromise?: A;
    force?: F | (() => F);
    comp_name?: S;
    [key: S]: A;
}
interface EnvDetectionState {
    moduleLevel: S | null;
    platform: S | null;
    compilers: S[];
    bundler: S | null;
    adapters: S[];
    ready: B;
}
export {};
