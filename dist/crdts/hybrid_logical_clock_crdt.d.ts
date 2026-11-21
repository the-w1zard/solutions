/** Opaque HLC timestamp in wire format. */
type HLCTimestamp = string;
/**
 * Structural check that a value looks like an HLC timestamp.
 * Not a validity check — `"9999999999999:9999:any"` passes. Use this at
 * bus boundaries to reject obvious garbage (nulls, non-strings, empty).
 */
export declare function isHLCTimestamp(v: unknown): v is HLCTimestamp;
export declare class HYBRID_LOGICAL_CLOCK_CRDT {
    private wallTime;
    private logical;
    private readonly nodeId;
    private static readonly MAX_SKEW_MS;
    constructor(nodeId?: string);
    tick(): string;
    update(remoteTimestamp: string): void;
    compare(a: string, b: string): number;
    private stamp;
}
export {};
