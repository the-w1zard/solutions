export declare class LS {
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
    get(key: string): any;
    getMany(keys: string[]): Promise<Record<string, any>>;
    set(key: string, value: string | object): Promise<{} | undefined>;
    update(key: string, value: string | object): Promise<void>;
    setMany(entries: Record<string, any>): Promise<void>;
    delete(key: string): Promise<void>;
    deleteMany(keys: string[]): Promise<void>;
    subscribe<T>(key: string, cb: (value: T) => void): () => void;
    clear(): void;
    private _emit;
    private _peek;
    has(key: string): boolean;
    waitFor<T>(key: string): Promise<T>;
}
export declare const ls: LS;
