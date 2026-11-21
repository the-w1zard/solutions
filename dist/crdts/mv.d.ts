import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";
export interface MVEntry<T> {
    value: T;
    stamp: string;
}
export declare class MV_REGISTER<T> {
    private entries;
    private readonly nodeId;
    private readonly hlc;
    constructor(nodeId: string, hlc: HYBRID_LOGICAL_CLOCK, initial?: T);
    /** Write a value. Concurrent writes from other stamps are preserved.
     * Entries causally dominated by the new write are dropped — same-HYBRID_LOGICAL_CLOCK
     * earlier ticks and anything we've already seen ordered before us. */
    set(value: T): void;
    /** All concurrent values currently observable. */
    values(): T[];
    /** All entries with their stamps (for conflict UIs). */
    entriesOf(): MVEntry<T>[];
    /** How many concurrent values exist (1 = no divergence). */
    concurrency(): number;
    /** The current resolved value: LWW winner by HYBRID_LOGICAL_CLOCK order (same total
     * order as LWW_REGISTER), without discarding the losers. */
    get(): T | undefined;
    /** Set-union merge by stamp — the CRDT law. Never loses a value. */
    merge(other: MV_REGISTER<T> | MVEntry<T>[]): void;
    getState(): MVEntry<T>[];
    setState(state: MVEntry<T>[]): void;
    /** Collapse divergence to a single value. Default: LWW by HYBRID_LOGICAL_CLOCK. A custom
     * resolver receives the concurrent entries and returns the survivor. */
    collapse(resolve?: (entries: MVEntry<T>[]) => MVEntry<T>): T | undefined;
}
