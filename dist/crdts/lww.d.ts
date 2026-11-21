import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";
export interface HLCState {
    wall: number;
    logical: number;
    node: string;
}
export interface LWWState<T = any> {
    value: T | undefined;
    stamp: string;
    _hlc?: HLCState;
}
export declare class LWW_REGISTER<T> {
    private readonly nodeId;
    private readonly hlc;
    private value;
    private stamp;
    constructor(nodeId: string, hlc: HYBRID_LOGICAL_CLOCK, initial?: T);
    set(value: T): void;
    get(): T | undefined;
    /** HLC.compare(), not Date.now() — this is what closes the "LWW depends on
     * synchronized clocks" gap flagged in research. HLC ties are broken by its
     * own embedded logical counter + node id, so two concurrent writes never
     * produce a genuine tie needing an arbitrary secondary rule. */
    merge(other: LWW_REGISTER<T> | LWWState<T>): void;
    getState(): LWWState<T>;
    setState(state: LWWState<T>): void;
}
