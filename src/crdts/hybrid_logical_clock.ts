export class HYBRID_LOGICAL_CLOCK {
    private wallTime: number = 0;
    private logical: number = 0;
    private readonly nodeId: string

    constructor(nodeId?: string) {
        this.nodeId = nodeId ?? Math.random().toString(36).slice(2, 10)
    }


    public tick(): string {
        const now = Date.now();
        if (now > this.wallTime) {
            this.wallTime = now;
            this.logical = 0;
        } else {
            this.logical++;
        }

        if (this.nodeId) return `${this.wallTime}:${this.logical}:${this.nodeId}`
        return `${this.wallTime}:${this.logical}`;
    }

    public update(remoteTimestamp: string): void {
        const [remoteWall, remoteLogical] = remoteTimestamp.split(':').map(Number);
        const now = Date.now();

        if (remoteWall > this.wallTime && remoteWall > now) {
            this.wallTime = remoteWall;
            this.logical = remoteLogical + 1;
        } else if (remoteWall === this.wallTime) {
            this.logical = Math.max(this.logical, remoteLogical) + 1;
        } else if (now > this.wallTime) {
            this.wallTime = now;
            this.logical = 0;
        }
    }

    public compare(a: string, b: string): number {
        const [wallA, logicalA] = a.split(':').map(Number);
        const [wallB, logicalB] = b.split(':').map(Number);
        if (wallA !== wallB) return wallA - wallB;
        return logicalA - logicalB;
    }
}
