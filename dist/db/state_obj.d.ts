declare class BYTE_ID {
    MAX_PENDING: number;
    sentTimestamps: Float64Array;
    pendingResolvers: Array<any>;
    cursor: number;
    private readonly counter;
    private epoch;
    id(): string;
    _sid(): string;
    constructor();
}
export declare const _bid: BYTE_ID;
export declare const ROOT_STATE_REG = "__ROOT_STATE_REG__";
export declare const MASTER_STATE_REG = "__MASTER_STATE_REG__";
export declare const SLAVE_STATE_REG = "__SLAVE_STATE_REG__";
export interface ScopeOptions {
    sl_reg?: any;
    ms_reg?: any;
    globalKey?: any;
}
type ObjDict<T = any> = Record<string | symbol, T>;
export declare function getStateStoreMap<K extends string | symbol, V>(sl_reg?: any, ms_reg?: any, globalKey?: any): ObjDict<V>;
export declare const store: {
    get<T>(key: string | symbol, opts?: ScopeOptions): T | undefined;
    set<T>(key: string | symbol, value: T | ((prev: T | undefined) => T), opts?: {
        triggerRender?: boolean;
    } & ScopeOptions): void;
    subscribe<T>(key: string | symbol, listener: (value: T) => void, opts?: ScopeOptions): () => void;
    delete(key: string | symbol, opts?: ScopeOptions): boolean;
    entries<T = any>(opts?: ScopeOptions): [string | symbol, T][];
    persist(key: string | symbol, opts?: ScopeOptions): void;
    unpersist(key: string | symbol, opts?: ScopeOptions): void;
    has(key: string | symbol, opts?: ScopeOptions): boolean;
    clear(opts?: ScopeOptions): void;
    clearPersistent(opts?: ScopeOptions): void;
};
export interface SauronState {
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
}
interface ContextStateMetadata {
    _batches: Set<string | symbol>;
    _batchQueue: ObjDict<any>;
    _batchOpts: ObjDict<{
        triggerRender?: boolean;
    }>;
    _globalListeners: Set<(key: string | symbol, value: any) => void>;
}
export declare function getContextStateMetadata(sl_reg?: any, ms_reg?: any, globalKey?: any): ContextStateMetadata;
export declare const state: SauronState;
export default state;
export declare function publish(key: string | symbol, value: any, opts?: ScopeOptions): void;
export declare function subscribe<T = any>(key: string | symbol, listener: (value: T) => void, opts?: ScopeOptions): () => void;
export declare function getAll<T = any>(opts?: ScopeOptions): Record<string | symbol, T>;
export declare function set<T>(label: string, value: T, triggerRender?: boolean, sl_reg?: any, ms_reg?: any, globalKey?: any): void;
export declare function get<T>(label: string, sl_reg?: any, ms_reg?: any, globalKey?: any): T | undefined;
export declare function subcribe<T>(label: string, fn: (value: T) => void, sl_reg?: any, ms_reg?: any, globalKey?: any): () => void;
export declare function del(label: string, sl_reg?: any, ms_reg?: any, globalKey?: any): boolean;
export declare function subAll(fn: (key: string | symbol, value: any) => void, sl_reg?: any, ms_reg?: any, globalKey?: any): () => void;
