export enum CausalRelation {
    EQUAL = 0,
    BEFORE = -1,
    AFTER = 1,
    CONCURRENT = 2
  }
  
  /**
   * High-Performance Binary Version Vector
   * Backed by a contiguous ArrayBuffer slab with sorted Node ID hashes for zero-allocation causal checks.
   */
  export class VERSION_VECTOR {
    private buffer: ArrayBuffer;
    private view: DataView;
    private memoryU8: Uint8Array;
  
    /**
     * Slot layout per Node Entry (16 bytes):
     * [0..3]   Node ID Hash (Uint32) - Maintained in strictly sorted ascending order
     * [4..11]  Sequence / Counter (BigUint64)
     * [12..15] Reserved / Padding (4 bytes)
     */
    private static readonly SLOT_SIZE = 16;
    private capacity: number;
    private count: number = 0;
    private localNodeIdHash: number;
  
    constructor(localNodeId: string, initialCapacity: number = 16) {
      this.localNodeIdHash = this.hashString(localNodeId);
      this.capacity = initialCapacity;
      this.buffer = new ArrayBuffer(this.capacity * VERSION_VECTOR.SLOT_SIZE);
      this.view = new DataView(this.buffer);
      this.memoryU8 = new Uint8Array(this.buffer);
    }
  
    private hashString(str: string): number {
      let hash = 2166136261;
      for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }
  
    /**
     * Increments the sequence number for the local node.
     */
    public incrementLocal(): bigint {
      return this.increment(this.localNodeIdHash);
    }
  
    public increment(nodeIdHash: number): bigint {
      const index = this.findIndexOrInsertionPoint(nodeIdHash);
      
      if (index >= 0 && index < this.count && this.view.getUint32(index * VERSION_VECTOR.SLOT_SIZE, true) === nodeIdHash) {
        const offset = index * VERSION_VECTOR.SLOT_SIZE + 4;
        const current = this.view.getBigUint64(offset, true);
        const next = current + 1n;
        this.view.setBigUint64(offset, next, true);
        return next;
      } else {
        const insertAt = index < 0 ? ~index : index;
        if (this.count >= this.capacity) {
          this.resize();
        }
        if (insertAt < this.count) {
          const byteOffset = insertAt * VERSION_VECTOR.SLOT_SIZE;
          const moveBytes = (this.count - insertAt) * VERSION_VECTOR.SLOT_SIZE;
          this.memoryU8.copyWithin(byteOffset + VERSION_VECTOR.SLOT_SIZE, byteOffset, byteOffset + moveBytes);
        }
        const offset = insertAt * VERSION_VECTOR.SLOT_SIZE;
        this.view.setUint32(offset, nodeIdHash, true);
        this.view.setBigUint64(offset + 4, 1n, true);
        this.count++;
        return 1n;
      }
    }
  
    /**
     * Gets the sequence number for a given node ID hash.
     */
    public get(nodeIdHash: number): bigint {
      const index = this.findIndexOrInsertionPoint(nodeIdHash);
      if (index >= 0 && index < this.count && this.view.getUint32(index * VERSION_VECTOR.SLOT_SIZE, true) === nodeIdHash) {
        return this.view.getBigUint64(index * VERSION_VECTOR.SLOT_SIZE + 4, true);
      }
      return 0n;
    }
  
    /**
     * Sets or updates a node's sequence number.
     */
    public set(nodeIdHash: number, seq: bigint): void {
      const index = this.findIndexOrInsertionPoint(nodeIdHash);
      if (index >= 0 && index < this.count && this.view.getUint32(index * VERSION_VECTOR.SLOT_SIZE, true) === nodeIdHash) {
        this.view.setBigUint64(index * VERSION_VECTOR.SLOT_SIZE + 4, seq, true);
      } else {
        const insertAt = index < 0 ? ~index : index;
        if (this.count >= this.capacity) {
          this.resize();
        }
        if (insertAt < this.count) {
          const byteOffset = insertAt * VERSION_VECTOR.SLOT_SIZE;
          const moveBytes = (this.count - insertAt) * VERSION_VECTOR.SLOT_SIZE;
          this.memoryU8.copyWithin(byteOffset + VERSION_VECTOR.SLOT_SIZE, byteOffset, byteOffset + moveBytes);
        }
        const offset = insertAt * VERSION_VECTOR.SLOT_SIZE;
        this.view.setUint32(offset, nodeIdHash, true);
        this.view.setBigUint64(offset + 4, seq, true);
        this.count++;
      }
    }
  
    /**
     * Merges a remote version vector into this vector via point-wise maximum (`Math.max` per node ID).
     */
    public merge(remote: VERSION_VECTOR): void {
      // Zero-allocation linear merge-join over sorted buffers
      let i = 0; // local pointer
      let j = 0; // remote pointer
      const slotSize = VERSION_VECTOR.SLOT_SIZE;
  
      while (j < remote.count) {
        const remoteHash = remote.view.getUint32(j * slotSize, true);
        const remoteSeq = remote.view.getBigUint64(j * slotSize + 4, true);
  
        const localIndex = this.findIndexOrInsertionPoint(remoteHash);
        if (localIndex >= 0 && localIndex < this.count && this.view.getUint32(localIndex * slotSize, true) === remoteHash) {
          const localOffset = localIndex * slotSize + 4;
          const localSeq = this.view.getBigUint64(localOffset, true);
          if (remoteSeq > localSeq) {
            this.view.setBigUint64(localOffset, remoteSeq, true);
          }
        } else {
          // Insert missing remote node entry
          this.set(remoteHash, remoteSeq);
        }
        j++;
      }
    }
  
    /**
     * Compares two version vectors causally with zero allocations.
     * - BEFORE: self <= other (and strictly smaller in at least one component)
     * - AFTER: self >= other (and strictly larger in at least one component)
     * - EQUAL: all components identical
     * - CONCURRENT: neither dominates the other
     */
    public compare(other: VERSION_VECTOR): CausalRelation {
      let lessOrEqual = true;
      let greaterOrEqual = true;
  
      const slotSize = VERSION_VECTOR.SLOT_SIZE;
      
      // Collect all unique node hashes across both vectors
      // Since both are sorted, we can merge-scan in O(n + m)
      let i = 0;
      let j = 0;
  
      while (i < this.count || j < other.count) {
        let localHash = 0xFFFFFFFF;
        let localSeq = 0n;
        let remoteHash = 0xFFFFFFFF;
        let remoteSeq = 0n;
  
        if (i < this.count) {
          localHash = this.view.getUint32(i * slotSize, true);
          localSeq = this.view.getBigUint64(i * slotSize + 4, true);
        }
        if (j < other.count) {
          remoteHash = other.view.getUint32(j * slotSize, true);
          remoteSeq = other.view.getBigUint64(j * slotSize + 4, true);
        }
  
        let activeHash: number;
        let lSeq = 0n;
        let rSeq = 0n;
  
        if (i < this.count && (j >= other.count || localHash < remoteHash)) {
          activeHash = localHash;
          lSeq = localSeq;
          rSeq = other.get(activeHash);
          i++;
        } else if (j < other.count && (i >= this.count || remoteHash < localHash)) {
          activeHash = remoteHash;
          lSeq = this.get(activeHash);
          rSeq = remoteSeq;
          j++;
        } else {
          activeHash = localHash;
          lSeq = localSeq;
          rSeq = remoteSeq;
          i++;
          j++;
        }
  
        if (lSeq > rSeq) lessOrEqual = false;
        if (lSeq < rSeq) greaterOrEqual = false;
      }
  
      if (lessOrEqual && greaterOrEqual) return CausalRelation.EQUAL;
      if (lessOrEqual) return CausalRelation.BEFORE;
      if (greaterOrEqual) return CausalRelation.AFTER;
      return CausalRelation.CONCURRENT;
    }
  
    private findIndexOrInsertionPoint(hash: number): number {
      let low = 0;
      let high = this.count - 1;
  
      while (low <= high) {
        const mid = (low + high) >>> 1;
        const midHash = this.view.getUint32(mid * VERSION_VECTOR.SLOT_SIZE, true);
  
        if (midHash === hash) {
          return mid;
        } else if (midHash < hash) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      return ~low;
    }
  
    private resize(): void {
      this.capacity *= 2;
      const newBuffer = new ArrayBuffer(this.capacity * VERSION_VECTOR.SLOT_SIZE);
      const newMemoryU8 = new Uint8Array(newBuffer);
      newMemoryU8.set(this.memoryU8);
      this.buffer = newBuffer;
      this.view = new DataView(this.buffer);
      this.memoryU8 = newMemoryU8;
    }
  }
