export declare class COOKIE {
    private ttl_active;
    private ttl_minutes;
    protected memoryTimer?: ReturnType<typeof setTimeout>;
    protected touchMemory(): void;
    protected memory: Map<string, unknown>;
    _channel?: BroadcastChannel;
    _localChange: boolean;
    private subscribers;
    constructor();
    ser(value: unknown): string;
    deser(raw: string | null): any;
    _broadcast(key: string, value: string, storageType: string, fn: string, path?: string, domain?: string, options?: any): void;
    private _withLock;
    private getCookieRaw;
    private setCookieRaw;
    get(key: string): any;
    getMany(keys: string[]): Promise<Record<string, any>>;
    set(key: string, value: any, options?: {
        maxAge?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    }): Promise<void>;
    update(key: string, value: any, options?: {
        maxAge?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    }): Promise<void>;
    setMany(entries: Record<string, any>, options?: {
        maxAge?: number;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    }): Promise<void>;
    delete(key: string, path?: string, domain?: string): Promise<void>;
    deleteMany(keys: string[]): Promise<void>;
    subscribe<T>(key: string, cb: (value: T) => void): () => void;
    clear(): void;
    has(key: string): boolean;
    private _emit;
    private _peek;
    waitFor<T>(key: string): Promise<T>;
}
export declare const cookie: COOKIE;
