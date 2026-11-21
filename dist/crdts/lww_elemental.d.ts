export interface TimestampedEntry {
    timestamp: number;
    nodeId: string;
}
export interface LWWElementSetPayload {
    adds: [string, TimestampedEntry][];
    removes: [string, TimestampedEntry][];
}
/**
 * High-performance LWW-Element-Set CRDT.
 * Supports add and remove cycles with deterministic Last-Write-Wins tie-breaking.
 */
export declare class LWW_ELEMENTAL {
    private readonly tieBreakBias;
    private adds;
    private removes;
    constructor(tieBreakBias?: 'add' | 'remove');
    /**
     * Adds an element to the set with a causal timestamp and node identifier.
     */
    add(element: string, timestamp: number, nodeId: string): void;
    /**
     * Removes an element from the set with a causal timestamp and node identifier.
     */
    remove(element: string, timestamp: number, nodeId: string): void;
    /**
     * Evaluates whether an element is currently active in the set.
     * Rule: An element is present if its latest add timestamp is strictly greater than its latest remove timestamp.
     * If timestamps are equal, the tie-break bias (default 'add') resolves the conflict.
     */
    has(element: string): boolean;
    /**
     * Compares incoming timestamp/nodeId against existing entry using LWW rules.
     */
    private isNewer;
    /**
     * Returns all active elements currently in the set.
     */
    values(): string[];
    /**
     * Merges a remote payload into this set using point-wise max timestamp comparison.
     */
    merge(remote: LWWElementSetPayload): void;
    /**
     * Exports state snapshot for network transport or replication.
     */
    exportState(): LWWElementSetPayload;
}
