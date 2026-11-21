export interface LruCache<Key extends string, Value> {
    get(key: Key): Value | undefined;
    set(key: Key, value: Value): void;
}
export declare const createLruCache: <Key extends string, Value>(maxCacheSize: number) => LruCache<Key, Value>;
