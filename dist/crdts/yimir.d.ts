export declare class YMIR<T> {
    private key;
    private opts;
    serverValue: T | null;
    localValue: T | null;
    serverVersion: number;
    staff: any;
    private listeners;
    private lastPrefetch;
    constructor(staff: any, key: string, opts?: YmirOptions<T>);
    subscribe(fn: (value: T) => void): () => void;
    private notify;
    shouldPrefetch(): boolean;
    write(newValue: T, options: YmirWriteOptions<T>): Promise<T>;
    private resolve;
}
