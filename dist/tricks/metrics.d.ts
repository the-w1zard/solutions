export declare class METRICS_PORNSTAR {
    private _startTime;
    private _nodeId;
    private _snapshots;
    private _maxSnapshots;
    private _queueMetrics;
    private _floodGateMetrics;
    private _laneMetrics;
    private _adapterMetrics;
    private _backpressureMetrics;
    private _channelMetrics;
    private _featureMetrics;
    private _eventLoopLag;
    private _lagMeasurements;
    private traces;
    private readonly MAX_TRACES;
    private traceOrder;
    constructor();
    recordQueue(action: 'enqueue' | 'dequeue' | 'drop' | 'process' | 'drain', duration?: number): void;
    recordFloodGate(gateNumber: 1 | 2 | 3 | 4, latency: number, error?: Error): void;
    recordLane(lane: 'normal' | 'signal' | 'binary' | 'signal_save_value', latency: number, error?: Error): void;
    recordAdapter(id: string, latency: number, isFloodGate?: boolean, error?: Error): void;
    recordBackpressure(throttled: boolean, duration?: number): void;
    recordChannel(rt: string, handlerCount?: number): void;
    recordFeature(feature: keyof typeof this._featureMetrics): void;
    snapshot(queueSize: number, maxQueueSize: number, openGates: number, throttled: boolean, adapters: Set<any>, channels: Map<string, Set<any>>): MetricsSnapshot;
    getHistory(limit?: number): MetricsSnapshot[];
    getLatest(): MetricsSnapshot | null;
    getMetricsSummary(): {
        totalMessages: number;
        totalErrors: number;
        avgLatency: number;
        throughput: number;
        queuePressure: number;
        activeAdapters: number;
        features: {
            beacon: N;
            radar: N;
            vessel: N;
            dock: N;
            convoy: N;
            sonar: N;
            heartbeat: N;
            watchdog: N;
            floodGate: N;
            pipeline: N;
            tide: N;
            mesh: N;
            crdt: N;
            synapse: N;
            transaction: N;
            circuitBreaker: N;
            rateLimit: N;
        };
    };
    getStreamData(): {
        adapters: {
            id: S;
            total: N;
            failures: N;
            avgLatency: N;
            throughput: N;
            errorRate: N;
            healthy: B;
            floodGateProcessed: N;
        }[];
        history: {
            timestamp: number;
            queueSize: number;
            openGates: number;
            throughput: number;
            avgLatency: number;
            errors: number;
        }[];
        timestamp: N;
        nodeId: S;
        uptime: N;
        queue: {
            currentSize: N;
            maxSize: N;
            fillPercent: N;
            peakSize: N;
            totalEnqueued: N;
            totalDropped: N;
            totalProcessed: N;
            drainCount: N;
            avgDrainTime: N;
            deadLetterSize: N;
        };
        floodGates: {
            openGates: N;
            gate1: {
                hits: N;
                errors: N;
                lastHit: N;
                avgLatency: N;
            };
            gate2: {
                hits: N;
                errors: N;
                lastHit: N;
                avgLatency: N;
            };
            gate3: {
                hits: N;
                errors: N;
                lastHit: N;
                avgLatency: N;
            };
            gate4: {
                hits: N;
                errors: N;
                lastHit: N;
                avgLatency: N;
            };
            totalHits: N;
            totalErrors: N;
            bypassRate: N;
            avgLatency: N;
            throughputPerSecond: N;
        };
        lanes: {
            normal: {
                processed: N;
                avgLatency: N;
                errors: N;
                throughput: N;
            };
            signal: {
                processed: N;
                avgLatency: N;
                errors: N;
                throughput: N;
            };
            binary: {
                processed: N;
                avgLatency: N;
                errors: N;
                throughput: N;
            };
            signal_save_value: {
                processed: N;
                avgLatency: N;
                errors: N;
                throughput: N;
            };
        };
        backpressure: {
            throttled: B;
            throttleCount: N;
            lastThrottle: N;
            avgQueueDepth: N;
            maxQueueDepth: N;
            totalBackpressureEvents: N;
        };
        channels: {
            total: N;
            activeSubs: N;
            totalMessages: N;
            topChannels: Array<{
                name: S;
                count: N;
            }>;
        };
        system: {
            memoryUsage: NodeJS.MemoryUsage;
            cpuUsage: NodeJS.CpuUsage;
            eventLoopLag: N;
            activeHandlers: N;
            pendingRequests: N;
        };
        features: {
            beacon: N;
            radar: N;
            vessel: N;
            dock: N;
            convoy: N;
            sonar: N;
            heartbeat: N;
            watchdog: N;
            floodGate: N;
            pipeline: N;
            tide: N;
            mesh: N;
            crdt: N;
            synapse: N;
            transaction: N;
            circuitBreaker: N;
            rateLimit: N;
        };
    };
    reset(): void;
    private getOrCreateTrace;
    traceStage(id: string, rt: string, stage: StageName, detail?: Record<string, unknown>, ms?: string): void;
    traceLane(id: string, lane: LaneName): void;
    traceGate(id: string, gate: GateNumber): void;
    traceAdapter(id: string, adapterId: string): void;
    tracePayloadSize(id: string, bytes: number): void;
    finishTrace(id: string, outcome: MessageTrace['outcome']): void;
    getMessageTrace(id: string): MessageTrace | null;
    getRecentTraces(limit?: number): MessageTrace[];
    getTracesByChannel(rt: string, limit?: number): MessageTrace[];
    getTracesByAdapter(adapterId: string, limit?: number): MessageTrace[];
    getTracesByOutcome(outcome: MessageTrace['outcome'], limit?: number): MessageTrace[];
}
