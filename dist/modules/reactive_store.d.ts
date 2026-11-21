export {};
export interface RiftRecord<T = A> {
    opened: B;
    claimed: B;
    value?: T;
    createdAt: N;
    openedAt?: N;
}
type StoreListener<T = A> = (v: RiftRecord<T>) => void;
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
