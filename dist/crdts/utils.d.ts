export type Json = null | boolean | number | string | Json[] | {
    [key: string]: Json;
};
export type ReplicaId = string;
export type ElementKey = string;
export interface Hlc {
    readonly physical: number;
    readonly logical: number;
    readonly replicaId: ReplicaId;
}
export interface CausalContext {
    /** Highest HLC observed from each replica. */
    readonly watermarks: Record<ReplicaId, string>;
}
/**
 * Total order over HLCs:
 * physical time, then logical counter, then replica ID.
 */
export declare function encodeHlc(hlc: Hlc): string;
export declare function decodeHlc(encoded: string): Hlc;
export declare function compareHlc(a: string, b: string): number;
