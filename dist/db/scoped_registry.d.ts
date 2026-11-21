import { type SauronState } from "./state.js";
export interface SauronRegistry extends SauronState {
    /** Diagnostic name for this scoped registry. */
    readonly name: string;
    /** Read a value by key. */
    get<T = unknown>(key: string | symbol): T | undefined;
    /** Write a value (or updater function) by key. */
    set<T>(key: string | symbol, value: T | ((prev: T | undefined) => T), opts?: {
        triggerRender?: boolean;
    }): void;
    /** Remove a key. Returns `true` if the key existed. */
    delete(key: string | symbol): boolean;
    /** All entries whose string key starts with `prefix`. */
    getByPrefix<T = unknown>(prefix: string): {
        key: string;
        value: T;
    }[];
    /** Snapshot of every entry. */
    getAll<T = unknown>(): Record<string | symbol, T>;
    /** Subscribe to changes for a single key. Returns an unsubscribe fn. */
    subscribe<T = unknown>(key: string | symbol, listener: (value: T) => void): () => void;
    /** Subscribe to every key change. Returns an unsubscribe fn. */
    subscribeAll(listener: (key: string | symbol, value: unknown) => void): () => void;
    /** Coalesce multiple `set` calls on `key` into a single notification. */
    batch(key: string | symbol, fn: () => void): void;
    /** Wipe all state and listeners. */
    clear(): void;
    /** Tear down the registry (currently equivalent to `clear`). */
    destroy(): void;
}
export declare function createScopedReg(name?: string): SauronRegistry;
