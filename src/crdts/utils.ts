export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };
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
  export function encodeHlc(hlc: Hlc): string {
    return [
      hlc.physical.toString(36).padStart(11, '0'),
      hlc.logical.toString(36).padStart(6, '0'),
      hlc.replicaId,
    ].join(':');
  }
  
  export function decodeHlc(encoded: string): Hlc {
    const parts = encoded.split(':');
  
    if (parts.length !== 3) {
      throw new TypeError(`Invalid HLC: ${encoded}`);
    }
  
    const physical = Number.parseInt(parts[0], 36);
    const logical = Number.parseInt(parts[1], 36);
  
    if (!Number.isFinite(physical) || !Number.isFinite(logical)) {
      throw new TypeError(`Invalid HLC: ${encoded}`);
    }
  
    return {
      physical,
      logical,
      replicaId: parts[2],
    };
  }
  export function compareHlc(a: string, b: string): number {
    if (a === b) return 0;
  
    const left = decodeHlc(a);
    const right = decodeHlc(b);
  
    if (left.physical !== right.physical) {
      return left.physical - right.physical;
    }
  
    if (left.logical !== right.logical) {
      return left.logical - right.logical;
    }
  
    if (left.replicaId === right.replicaId) return 0;
  
    return left.replicaId < right.replicaId ? -1 : 1;
  }
