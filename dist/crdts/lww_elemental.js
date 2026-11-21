/**
 * High-performance LWW-Element-Set CRDT.
 * Supports add and remove cycles with deterministic Last-Write-Wins tie-breaking.
 */
export class LWW_ELEMENTAL {
    tieBreakBias;
    adds = new Map();
    removes = new Map();
    constructor(tieBreakBias = 'add') {
        this.tieBreakBias = tieBreakBias;
    }
    /**
     * Adds an element to the set with a causal timestamp and node identifier.
     */
    add(element, timestamp, nodeId) {
        const existingAdd = this.adds.get(element);
        if (!existingAdd || this.isNewer(timestamp, nodeId, existingAdd.timestamp, existingAdd.nodeId)) {
            this.adds.set(element, { timestamp, nodeId });
        }
    }
    /**
     * Removes an element from the set with a causal timestamp and node identifier.
     */
    remove(element, timestamp, nodeId) {
        const existingRemove = this.removes.get(element);
        if (!existingRemove || this.isNewer(timestamp, nodeId, existingRemove.timestamp, existingRemove.nodeId)) {
            this.removes.set(element, { timestamp, nodeId });
        }
    }
    /**
     * Evaluates whether an element is currently active in the set.
     * Rule: An element is present if its latest add timestamp is strictly greater than its latest remove timestamp.
     * If timestamps are equal, the tie-break bias (default 'add') resolves the conflict.
     */
    has(element) {
        const addEntry = this.adds.get(element);
        if (!addEntry)
            return false;
        const removeEntry = this.removes.get(element);
        if (!removeEntry)
            return true; // Added and never removed
        if (addEntry.timestamp > removeEntry.timestamp) {
            return true;
        }
        if (removeEntry.timestamp > addEntry.timestamp) {
            return false;
        }
        // Timestamps are equal — apply deterministic tie-break bias
        if (addEntry.timestamp === removeEntry.timestamp) {
            if (addEntry.nodeId === removeEntry.nodeId) {
                return this.tieBreakBias === 'add';
            }
            // Secondary tie-break: highest node ID wins
            return addEntry.nodeId > removeEntry.nodeId;
        }
        return false;
    }
    /**
     * Compares incoming timestamp/nodeId against existing entry using LWW rules.
     */
    isNewer(newTs, newNodeId, oldTs, oldNodeId) {
        if (newTs > oldTs)
            return true;
        if (newTs < oldTs)
            return false;
        return newNodeId > oldNodeId; // Higher node ID wins ties
    }
    /**
     * Returns all active elements currently in the set.
     */
    values() {
        const active = [];
        // Iterate over all unique keys ever added
        for (const element of this.adds.keys()) {
            if (this.has(element)) {
                active.push(element);
            }
        }
        return active;
    }
    /**
     * Merges a remote payload into this set using point-wise max timestamp comparison.
     */
    merge(remote) {
        for (const [element, remoteAdd] of remote.adds) {
            const localAdd = this.adds.get(element);
            if (!localAdd || this.isNewer(remoteAdd.timestamp, remoteAdd.nodeId, localAdd.timestamp, localAdd.nodeId)) {
                this.adds.set(element, remoteAdd);
            }
        }
        for (const [element, remoteRemove] of remote.removes) {
            const localRemove = this.removes.get(element);
            if (!localRemove || this.isNewer(remoteRemove.timestamp, remoteRemove.nodeId, localRemove.timestamp, localRemove.nodeId)) {
                this.removes.set(element, remoteRemove);
            }
        }
    }
    /**
     * Exports state snapshot for network transport or replication.
     */
    exportState() {
        return {
            adds: Array.from(this.adds.entries()),
            removes: Array.from(this.removes.entries())
        };
    }
}
