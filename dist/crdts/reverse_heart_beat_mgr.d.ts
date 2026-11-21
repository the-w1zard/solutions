import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";
export declare class DRSHeartbeatManager<T = string> {
    private readonly nodeId;
    private readonly hlc;
    private readonly rt;
    private readonly subChannel;
    private readonly sendSubFn;
    private readonly intervalMs;
    private orSet;
    private timer;
    private lastResetWallTime;
    constructor(nodeId: string, hlc: HYBRID_LOGICAL_CLOCK, rt: string, subChannel: string, sendSubFn: (rt: string, subChannel: string, p: any) => void, intervalMs?: number);
    start(onStateChange?: (activeNodes: T[]) => void): void;
    handleIncomingState(remoteState: ORSetState<T>, onStateChange?: (activeNodes: T[]) => void): void;
    ping(): void;
    stop(): void;
    getActiveNodes(): T[];
}
