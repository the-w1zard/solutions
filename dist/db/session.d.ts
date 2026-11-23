export declare const ROOT_REG = "__THE_WIZARD_REG__";
export declare const MASTER_REG = "__SAURON__";
export declare const SLAVE_REG = "__STATE__";
export declare class SESSION {
    private ttl_active;
    private ttl_minutes;
    protected memoryTimer?: ReturnType<typeof setTimeout>;
    protected touchMemory(): void;
    protected memory: Map<string, unknown>;
    _channel?: BroadcastChannel;
    private _echoId;
    private subscribers;
    constructor();
    ser(value: unknown): string;
    deser(raw: string | null): any;
    _broadcast(key: string, value: string, storageType: string, fn: string, path?: string, domain?: string, options?: any): void;
    private _withLock;
    get(key: string): any;
    getMany(keys: string[]): Promise<Record<string, any>>;
    set(key: string, value: string | object): Promise<{}>;
    update(key: string, value: string | object): Promise<void>;
    setMany(entries: Record<string, any>): Promise<void>;
    delete(key: string): Promise<void>;
    deleteMany(keys: string[]): Promise<void>;
    subscribe<T>(key: string, cb: (value: T) => void): () => void;
    clear(): void;
    private _emit;
    private _peek;
    has(key: string): boolean;
    waitFor<T>(key: string, timeoutMs?: number): Promise<T>;
}
export declare const session: SESSION;
export declare function getNestedStoreMap<K, V>(sl_reg?: any, ms_reg?: any, globalKey?: any): Map<K, V>;
export declare const session_store: {
    get<T>(key: any, opts?: ScopeOptions): T | undefined;
    set<T>(key: any, value: T | ((prev: T | undefined) => T), opts?: {
        triggerRender?: boolean;
    } & ScopeOptions): void;
    subscribe<T>(key: any, listener: (value: T) => void, opts?: ScopeOptions): () => void;
    delete(key: any, opts?: ScopeOptions): boolean;
    entries<T = any>(opts?: ScopeOptions): [any, T][];
    persist(key: any, opts?: ScopeOptions): void;
    unpersist(key: any, opts?: ScopeOptions): void;
    has(key: any, opts?: ScopeOptions): boolean;
    clear(opts?: ScopeOptions): void;
    clearPersistent(opts?: ScopeOptions): void;
};
export declare function getScopedStateMetadata(sl_reg?: any, ms_reg?: any, globalKey?: any): any;
export declare const session_state: {
    get<T>(key: string | symbol, opts?: ScopeOptions): T | undefined;
    set<T>(key: string | symbol, value: T | ((prev: T | undefined) => T), opts?: {
        triggerRender?: boolean;
    } & ScopeOptions): void;
    delete(key: string | symbol, opts?: ScopeOptions): boolean;
    getByPrefix<T>(prefix: string, opts?: ScopeOptions): {
        key: string;
        value: T;
    }[];
    getAll<T = any>(opts?: ScopeOptions): Record<string | symbol, T>;
    subscribe<T>(key: string | symbol, listener: (value: T) => void, opts?: ScopeOptions): () => void;
    subscribeAll(listener: (key: string | symbol, value: any) => void, opts?: ScopeOptions): () => void;
    batch(key: string | symbol, fn: () => void, opts?: ScopeOptions): void;
    clear(opts?: ScopeOptions): void;
};
export interface ScopeOptions {
    sl_reg?: any;
    ms_reg?: any;
    globalKey?: any;
}
export interface OptimisticHookState {
    previousValue: any;
    isPending: boolean;
}
export interface SStorageContext<T = any> {
    id: string;
    DefaultValue?: T;
    Provider?: any;
    sl_reg?: string;
    ms_reg?: string;
    globalKey?: string;
}
export interface SStorageState {
    get<T>(key: string, opts?: ScopeOptions): T | undefined;
    set<T>(key: string, value: T | ((prev: T | undefined) => T), opts?: {
        triggerRender?: boolean;
    } & ScopeOptions): void;
    delete(key: string, opts?: ScopeOptions): boolean;
    getByPrefix<T>(prefix: string, opts?: ScopeOptions): {
        key: string;
        value: T;
    }[];
    getAll<T = any>(opts?: ScopeOptions): Record<string, T>;
    subscribe<T>(key: string, listener: (value: T) => void, opts?: ScopeOptions): () => void;
    subscribeAll(listener: (key: string, value: any) => void, opts?: ScopeOptions): () => void;
    batch(key: string, fn: () => void, opts?: ScopeOptions): void;
    clear(opts?: ScopeOptions): void;
}
export interface SauronContext<T> {
    id: string;
    DefaultValue?: T;
    Provider?: any;
    sl_reg?: string;
    ms_reg?: string;
    globalKey?: string;
}
export declare function publishSSC(key: string | symbol, value: any, opts?: ScopeOptions): void;
export declare function subscribeSSC<T = any>(key: string | symbol, listener: (value: T) => void, opts?: ScopeOptions): () => void;
export declare function getAllSSC<T = any>(opts?: ScopeOptions): Record<string | symbol, T>;
export declare function setSSC<T>(label: string, value: T, triggerRender?: boolean, sl_reg?: any, ms_reg?: any, globalKey?: any): void;
export declare function getSSC<T>(label: string, sl_reg?: any, ms_reg?: any, globalKey?: any): T | undefined;
export declare function subSSC<T>(label: string, fn: (value: T) => void, sl_reg?: any, ms_reg?: any, globalKey?: any): () => void;
export declare function deleteSSC(label: string, sl_reg?: any, ms_reg?: any, globalKey?: any): boolean;
export declare function subAllSSC(fn: (key: string | symbol, value: any) => void, sl_reg?: any, ms_reg?: any, globalKey?: any): () => void;
