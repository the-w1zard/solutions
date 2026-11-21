export declare class AW_SET {
    private readonly localNodeId;
    private buffer;
    private view;
    private memoryU8;
    /**
     * Row layout (24 bytes):
     * [0..3]   Element Hash (u32)
     * [4..7]   Add Tag ID — creator's own sequence number at add time (u32)
     * [8..11]  Creator Node Hash (u32)
     * [12]     Status (u8: 0 active, 1 tombstoned)
     * [13..15] padding
     * [16..19] Remover Node Hash (u32, 0 if not removed)
     * [20..23] Remove Seq — remover's own sequence number at remove time (u32, 0 if not removed)
     */
    private static readonly SLOT_SIZE;
    private capacity;
    private count;
    private elementStrings;
    private elementNames;
    private nodeNames;
    private localSeq;
    private knownSeq;
    private peerDigests;
    private localNodeIdHash;
    private static readonly textEncoder;
    private static readonly textDecoder;
    constructor(localNodeId: string, initialCapacity?: number);
    private hashString;
    private bindName;
    private bumpKnown;
    add(element: string): void;
    remove(element: string): void;
    has(element: string): boolean;
    values(): string[];
    private writeRow;
    private resize;
    get version(): number;
    /** Digest of this node's current knowledge: nodeId -> highest seq incorporated. */
    private buildDigest;
    generateDelta(sinceVersion?: number): Uint8Array;
    /** senderNodeId: the peer you're directly syncing with (required — this is
     * what makes the digest trackable per-peer for compaction safety). */
    mergeDelta(deltaBytes: Uint8Array, senderNodeId: string): void;
    private findTagSlot;
    /** Drops tombstoned rows whose removal has been acknowledged — via digest —
     * by every peer this node has directly synced with (mergeDelta). A node
     * it has no digest for contributes nothing to the computed safety, so
     * nothing involving that node's activity compacts until a digest from
     * them has been received at least once. Returns rows dropped. */
    compact(): number;
}
