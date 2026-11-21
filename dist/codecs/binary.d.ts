interface HeaderViews {
    headerInt32: Int32Array;
    payloadUint8: Uint8Array;
    capacity: N;
}
interface DecodedFrame {
    topicId: N;
    topicName: S | UD;
    p: Uint8Array;
}
export type CBORValue = undefined | null | boolean | number | string | Uint8Array | CBORValue[] | {
    [k: string]: CBORValue;
};
declare class BINARY_CORE {
    ser(value: U): S;
    deser<T = A, Z = A>(raw: S | O | M<T, Z> | SET<T> | AR<T>): A;
    encodeJSONEnvelope(envelope: any): Uint8Array;
    decodeJSONEnvelope(bytes: Uint8Array): any;
    private readonly encoder;
    private readonly decoder;
    private ensureAvailable;
    private readUint;
    private encodeUint64;
    private encode;
    private encodeValue;
    private encodeUint;
    private decode;
    private decodeValue;
    encode_msg(msg: any): Uint8Array;
    decode_msg(raw: any): any;
    HEADER_SIZE_BYTES: number;
    HEADER_IDX_WRITE_HEAD: number;
    HEADER_IDX_READ_HEAD: number;
    HEADER_IDX_MUTEX: number;
    HEADER_IDX_CAPACITY: number;
    MUTEX_UNLOCKED: number;
    MUTEX_LOCKED: number;
    SENTINEL_WRAP_MARKER: number;
    createSharedDepotBuffer(capacityBytes: number): SharedArrayBuffer;
    mapDepotBuffer(sab: SharedArrayBuffer): HeaderViews;
    validateHeader(sab: SharedArrayBuffer): boolean;
    calculateFrameFootprint(payloadSizeBytes: number): number;
    FLYWEIGHT_FRAME: DecodedFrame;
    private topicToIdMap;
    private idToTopicMap;
    hashTopic(topic: string): number;
    getTopicId(topic: string): number;
    getTopicName(topicId: number): string | undefined;
    registerTopics(topics: string[]): void;
    resetRegistry(): void;
    private textEncoder;
    private headerBuffer;
    private headerView;
    private headerBytes;
    encodeFrame(topic: string, p: Uint8Array | string | Record<string, unknown>): Uint8Array;
    decodeFrame(frameBytes: Uint8Array): DecodedFrame;
}
export declare const BINARY: BINARY_CORE;
export {};
