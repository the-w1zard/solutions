export declare const rv: <T>(v: UF<T>) => T;
export declare const sameValue: (a: A, b: A) => B;
declare const EventEmitter: any;
type FlushCallback = () => V;
declare class Store extends EventEmitter {
    #private;
    r: string;
    m: string;
    s: string;
    state: {
        getMap: <K, V>(slave?: A, master?: A, rk?: A) => M2<K, V>;
        getMetadata: (s?: string, m?: string, r?: string) => any;
        get: <T = any>(key: A, opts?: A) => T | UD;
        set: <T = any>(key: A, value: T | ((prev: T | UD) => T), opts?: {
            triggerRender?: B;
            cap?: N;
        } & A) => any;
        subscribe: <T = any>(key: A, listener: (value: T) => V, opts?: A) => (() => V);
        delete: (key: A, opts?: A) => B;
        entries: <T = any>(opts?: A) => [A, T][];
        persist: (key: A, opts?: A) => V;
        unpersist: (key: A, opts?: A) => V;
        has: (key: A, opts?: A) => B;
        clear: (opts?: A) => V;
        clearPersistent: (opts?: A) => V;
        _emit: (key: S | SY, sl_reg?: string, ms_reg?: string, globalKey?: string) => V;
        scheduleNotify: (key: A, _listeners: Map<A, Set<(value: A) => V>>, _state: Map<A, A>) => V;
        scheduleGlobalNotify: (key: S | SY, meta: A, opts: A) => V;
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
    nextWaiterId: number;
    private nextDeferId;
    private draining;
    private drainAgain;
    private deferStats;
    private autoCloud;
    private warnedUseBeforeReady;
    private ENV_STATE;
    private shout;
    /** the results view — computed from the ONE registry, stored nowhere */
    get results(): RO<Array<ResultRecord>>;
    get size(): N;
    static readonly MODULE_LEVEL_CANDIDATES: readonly ["typescript", "rollup", "vite", "eslint", "babel", "postcss", "tailwindcss", "@babel/core", "prettier", "stylelint", "sass", "less", "jest", "vitest", "playwright", "@types/vscode"];
    static readonly PLATFORM_CANDIDATES: readonly ["PROJECT_PLATFORM_KILLER", "react", "preact", "@remix-run/react", "@react-router/react", "next", "nuxt", "svelte", "solid", "vite", "arfa", "vue", "angular", "astro", "gatsby", "dojo", "inferno", "lupine", "ember-source", "backbone", "alpinejs", "lit", "marko", "@builder.io/qwik", "solid-start", "@sveltejs/kit", "meteor", "stencil", "aurelia", "nodiff", "qwik", "velo-type", "webpack"];
    static readonly COMPILER_CANDIDATES: readonly ["rspack", "webpack", "vite", "rollup", "esbuild", "swc-loader", "babel", "next", "nuxt", "@remix-run/react", "@react-router/react", "svelte", "solid", "vue", "@swc/core", "turbopack", "parcel", "tsup", "unbuild", "esbuild-loader", "@babel/core", "terser", "@angular/core", "@angular/compile"];
    static readonly BUNDLER_CANDIDATES: readonly ["bun", "pnpm", "yarn", "npm"];
    static readonly ADAPTER_CANDIDATES: readonly ["websocket_dev_server", "cross_app_ws_server", "terminal_ngin_proxy_register", "terminal_ngin_proxy", "workspace_hub_server", "workspace_hub_client", "cross_app_ws_client", "cse_cross_app_server", "cse_cross_app_client", "shared_worker", "service_worker", "unix_worker", "broadcastr_channel", "websocket", "websocket_server", "websocket_client", "webrtc", "webrtc_server", "webrtc_client", "electron_server", "electron_client", "mqtt", "sse", "named_pipe", "worker_thread", "native_msg_host", "native_msg_client"];
    static readonly CAPABILITY_CANDIDATES: readonly ["shared_worker", "service_worker", "unix_worker", "broadcastr_channel", "electron_server", "electron_client", "named_pipe", "native_msg_host", "native_msg_client"];
    maelstrom: {
        (): void;
        log(where: S, detail?: R, type?: "info" | "success" | "warn" | "error"): void; /** resolve a specifier relative to THIS file, always. Absolute out. */
        key_for(specifier: S): S;
        normalizeFallback<F>(fallback: F | (() => F) | undefined, fallbackDefault: () => F): () => F; /** the safe proxy — missing module access is suppressed, never crashed */
        createSafeProxy(): A;
        toNamespace(m: A): A;
        blind: {
            (): void;
            /** dynamic import with no static dependency — works in every module system */
            import: (s: string) => Promise<any>;
            /** require with no static dependency — null where require does not exist (browser/ESM) */
            require: ((s: string) => A) | null;
        };
        has: {
            (): void;
            bun: boolean;
            node: boolean;
            local(filePath: S | undefined, module?: S): B;
            require: boolean;
        };
        is: {
            (): void;
            require_available(): B;
            browser: boolean;
            VSCode: string | false | undefined;
            electron: boolean;
            unix: boolean;
            windows: boolean;
        };
        record<T>(label: S, solver: Solver, value: T | undefined, store?: StoreKind): void;
        rift: {
            <T = any>(name: S): RiftLike<T>;
            clear(): V;
            inspect(): R;
            guard<T, R>(name: string, fn: (unlockValue: T) => R | Promise<R>, timeoutMs?: number): void;
            load<T = any>(specifier: S): Promise<T>;
            result<T = any>(label: S): ResultRecord<T> | undefined;
            resultsFrom(solver: Solver): ResultRecord[];
            onResult(listener: (r: ResultRecord) => V): (() => V);
            place<T = any>(label: S, value: T, store?: StoreKind): V;
            get_value<T = any>(label: S): T | undefined;
            read<T = any>(label: S, store?: StoreKind): T | undefined;
            reset(name: S): V;
            delete(name: S): B;
            bandit<T = any>(label: S, module?: A, wait?: N, store?: StoreKind): A;
            create<T = any>(label: S, module: T, store?: StoreKind): A;
            use<T = any>(label: S, wait?: N, apparation?: T, store?: StoreKind): A;
            resolve: {
                <T = any>(name: S, v: T): A;
                global<T = any>(name: S, wait?: N, fallback?: T): A;
            };
            has(module: S): B;
            make<T = any>(): RiftLike<T>;
            conjure: {
                <T = any, F = any>(options: OPTIONAL_IMPORT_OPTIONS<T, F>): A;
                get<T = any>(label: S, cache?: B, module?: B): A;
                uncached<T = any, F = any>(options: OPTIONAL_IMPORT_OPTIONS<T, F>): A;
            };
            use_if_available<T = any>(label: S, filePath: S, comp_name: S, fallback: T, opts?: {
                store?: StoreKind;
            }): T;
            probe<T = any>(label: S, filePath: S, comp_name: S, fallback: T): T;
            guard_promise_gate(get: A, name: string, fn: A, timeoutMs?: number): () => Promise<R>;
        };
        module: {
            <T = any>(module: S, filePath?: S): T | Promise<T>;
            extract_named(ns: A, comp_name: S): A;
            init: {
                (label: S, module?: B): A;
                named_export(label: S, comp_name: S, cache?: B, module?: B): A;
            };
            named_export<T = any>(label: S, comp_name: S, module?: B): A;
            check(moduleName: S): Promise<B>;
            isLoaded(specifier: S): B;
            getLoaded<T = any>(specifier: S): OPT<T>;
            export_of<T = any>(name: S, specifier?: S): OPT<T>;
            indexExports(rift: A, key: S, mod: A): void;
            require<T = any>(specifier: S): T;
        };
        waiter: {
            (deps: S | S[], fn: (v?: A) => V): N;
            releaseMulti(k: S, v: A): void;
            cancel(id: N): B;
            wait_and_promise<T = any>(timeoutMs: N, key: S, isOpen: B, current: A): Promise<T>;
        };
        defer: {
            (deps: S | S[], fn: (...v: A[]) => A): N;
            provide(k: S | Record<S, A>, v?: A): void;
            resolve(k: S): void;
            invalidate(k: S): B;
            has(k: S): B;
            get<T = any>(k: S): OPT<T>;
            cancel(id: N): B;
            ready(task: DeferredTask): B;
            drain(): V;
            reportError(task: DeferredTask, e: A): void;
            inspect(): R;
            clear(): void;
            onError(e: A, id: N, deps: S[]): void;
            onSuccess(id: N, deps: S[]): void;
        };
        detect: {
            (): void;
            capability(name: S): B;
            bundler(): S | null;
            firstMatch(candidates: readonly S[]): Promise<S | null>;
            all(candidates: readonly S[]): Promise<S[]>;
            environment(env_lib?: S): void;
            type(v: unknown): "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "set" | "function" | "ArrayBuffer" | "Array" | "error" | "null" | "Promise" | "Buffer" | "thenable" | "async-iterable" | "array" | "map" | "date" | "regexp" | "iterable" | "WeakMap" | "WeakSet" | "URL" | "URLSearchParams" | "plainObject" | "iterator" | undefined;
            cloudSupport(): B;
        };
        useEnvState(): EnvDetectionState & {
            rt: S;
            subChannel: S;
        };
        apparation: any;
        reset(): void;
    };
}
export { Store };
declare const _default: Store;
export default _default;
