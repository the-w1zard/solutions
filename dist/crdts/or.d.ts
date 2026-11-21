import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";
export interface ORSetState<T = any> {
    adds: {
        item: T;
        tag: string;
    }[];
    removes: {
        item: T;
        tag: string;
    }[];
}
export declare class OR_SET<T = any> {
    private readonly nodeId;
    private readonly hlc;
    private adds;
    private removes;
    constructor(nodeId: string, hlc: HYBRID_LOGICAL_CLOCK);
    add(item: T): void;
    /** Removes every currently-visible tag for this item — a concurrent add on
     * another node produces a NEW tag this remove never saw, so it survives.
     * That's the actual OR-Set guarantee: add wins over a remove it wasn't
     * causally aware of. */
    remove(item: T): void;
    has(item: T): boolean;
    values(): T[];
    /** Union of add-sets and remove-sets — both only ever grow. Tombstone
     * accumulation is real and disclosed, not solved here (see class header
     * gap on GC — no automatic pruning, matches the field guide's stated
     * concern that this is one of the hardest practical CRDT problems). */
    merge(other: OR_SET<T> | ORSetState<T>): void;
    getState(): ORSetState<T>;
    setState(state: ORSetState<T>): void;
    private equals;
}
