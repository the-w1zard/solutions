export declare class HYBRID_LOGICAL_CLOCK {
    private wallTime;
    private logical;
    private readonly nodeId;
    constructor(nodeId?: string);
    tick(): string;
    update(remoteTimestamp: string): void;
    compare(a: string, b: string): number;
}
