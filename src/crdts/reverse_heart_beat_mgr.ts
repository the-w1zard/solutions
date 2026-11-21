import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";
import { OR_SET } from "./or";

// #region ███████████████ REVERSE HEART BEAT MANAGER █████████████████████████████████
export class DRSHeartbeatManager<T = string> {
    private orSet: OR_SET<T>;
    private timer: NodeJS.Timeout | null = null;
    private lastResetWallTime: number = 0;

    constructor(
        private readonly nodeId: string,
        private readonly hlc: HYBRID_LOGICAL_CLOCK,
        private readonly rt: string,
        private readonly subChannel: string,
        private readonly sendSubFn: (rt: string, subChannel: string, p: any) => void,
        private readonly intervalMs: number = 30000
    ) {
        this.orSet = new OR_SET<T>(nodeId, hlc);
    }

    public start(onStateChange?: (activeNodes: T[]) => void) {
        if (this.timer) return;

        this.timer = setInterval(() => {
            // 1. Advance clock epoch
            this.hlc.tick();

            // 2. Epoch-based window reset: 
            // Instead of keeping infinite history, we clear the local adds/removes 
            // for the fresh 30-second liveness epoch cycle.
            this.orSet = new OR_SET<T>(this.nodeId, this.hlc);

            // 3. Register self as alive for this new window
            this.orSet.add(this.nodeId as unknown as T);

            // 4. Broadcast state across the bus
            const state = this.orSet.getState();
            this.sendSubFn(this.rt, this.subChannel, state);

            if (onStateChange) {
                onStateChange(this.orSet.values());
            }
        }, this.intervalMs);
    }

    public handleIncomingState(remoteState: ORSetState<T>, onStateChange?: (activeNodes: T[]) => void) {
        // Merge incoming node checks into our current window's set
        this.orSet.merge(remoteState);

        if (onStateChange) {
            onStateChange(this.orSet.values());
        }
    }

    public ping(): void {
        // Allows manual check-in if an event or useEffect triggers a state change outside the timer
        this.hlc.tick();
        this.orSet.add(this.nodeId as unknown as T);
        const state = this.orSet.getState();
        this.sendSubFn(this.rt, this.subChannel, state);
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    public getActiveNodes(): T[] {
        return this.orSet.values();
    }
}
// #endregion
