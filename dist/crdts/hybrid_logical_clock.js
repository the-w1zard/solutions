export class HYBRID_LOGICAL_CLOCK {
    wallTime = 0;
    logical = 0;
    nodeId;
    constructor(nodeId) {
        this.nodeId = nodeId ?? Math.random().toString(36).slice(2, 10);
    }
    tick() {
        const now = Date.now();
        if (now > this.wallTime) {
            this.wallTime = now;
            this.logical = 0;
        }
        else {
            this.logical++;
        }
        if (this.nodeId)
            return `${this.wallTime}:${this.logical}:${this.nodeId}`;
        return `${this.wallTime}:${this.logical}`;
    }
    update(remoteTimestamp) {
        const [remoteWall, remoteLogical] = remoteTimestamp.split(':').map(Number);
        const now = Date.now();
        if (remoteWall > this.wallTime && remoteWall > now) {
            this.wallTime = remoteWall;
            this.logical = remoteLogical + 1;
        }
        else if (remoteWall === this.wallTime) {
            this.logical = Math.max(this.logical, remoteLogical) + 1;
        }
        else if (now > this.wallTime) {
            this.wallTime = now;
            this.logical = 0;
        }
    }
    compare(a, b) {
        const [wallA, logicalA] = a.split(':').map(Number);
        const [wallB, logicalB] = b.split(':').map(Number);
        if (wallA !== wallB)
            return wallA - wallB;
        return logicalA - logicalB;
    }
}
