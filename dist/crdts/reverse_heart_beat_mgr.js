import { OR_SET } from "./or";
// #region ███████████████ REVERSE HEART BEAT MANAGER █████████████████████████████████
export class DRSHeartbeatManager {
    nodeId;
    hlc;
    rt;
    subChannel;
    sendSubFn;
    intervalMs;
    orSet;
    timer = null;
    lastResetWallTime = 0;
    constructor(nodeId, hlc, rt, subChannel, sendSubFn, intervalMs = 30000) {
        this.nodeId = nodeId;
        this.hlc = hlc;
        this.rt = rt;
        this.subChannel = subChannel;
        this.sendSubFn = sendSubFn;
        this.intervalMs = intervalMs;
        this.orSet = new OR_SET(nodeId, hlc);
    }
    start(onStateChange) {
        if (this.timer)
            return;
        this.timer = setInterval(() => {
            // 1. Advance clock epoch
            this.hlc.tick();
            // 2. Epoch-based window reset: 
            // Instead of keeping infinite history, we clear the local adds/removes 
            // for the fresh 30-second liveness epoch cycle.
            this.orSet = new OR_SET(this.nodeId, this.hlc);
            // 3. Register self as alive for this new window
            this.orSet.add(this.nodeId);
            // 4. Broadcast state across the bus
            const state = this.orSet.getState();
            this.sendSubFn(this.rt, this.subChannel, state);
            if (onStateChange) {
                onStateChange(this.orSet.values());
            }
        }, this.intervalMs);
    }
    handleIncomingState(remoteState, onStateChange) {
        // Merge incoming node checks into our current window's set
        this.orSet.merge(remoteState);
        if (onStateChange) {
            onStateChange(this.orSet.values());
        }
    }
    ping() {
        // Allows manual check-in if an event or useEffect triggers a state change outside the timer
        this.hlc.tick();
        this.orSet.add(this.nodeId);
        const state = this.orSet.getState();
        this.sendSubFn(this.rt, this.subChannel, state);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    getActiveNodes() {
        return this.orSet.values();
    }
}
// #endregion
