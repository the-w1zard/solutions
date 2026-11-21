export class METRICS_PORNSTAR {
    // #region ███ CONSTANTS ██████████████████████████████████████
    private _startTime = Date.now();
    private _nodeId = `node_${Math.random().toString(36).slice(2, 8)}`;
    private _snapshots: MetricsSnapshot[] = [];
    private _maxSnapshots = 200;
    // Queue Metrics
    private _queueMetrics = {
        totalEnqueued: 0,
        totalDropped: 0,
        totalProcessed: 0,
        peakSize: 0,
        currentSize: 0,
        drainCount: 0,
        totalDrainTime: 0,
        deadLetterSize: 0,
        avgQueueDepth: 0,
        depthSamples: 0
    };
    // Flood Gate Metrics - THE GOOD STUFF
    private _floodGateMetrics = {
        gate1: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
        gate2: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
        gate3: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
        gate4: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
        totalHits: 0,
        totalErrors: 0,
        totalLatency: 0,
        latencyCount: 0,
        bypassed: 0,
        queued: 0,
        lastWindowStart: Date.now(),
        windowHits: 0
    };
    // Lane Metrics - SPREAD 'EM WIDE
    private _laneMetrics = {
        normal: { processed: 0, errors: 0, totalLatency: 0, count: 0, lastWindowStart: Date.now(), windowCount: 0 },
        signal: { processed: 0, errors: 0, totalLatency: 0, count: 0, lastWindowStart: Date.now(), windowCount: 0 },
        binary: { processed: 0, errors: 0, totalLatency: 0, count: 0, lastWindowStart: Date.now(), windowCount: 0 },
        signal_save_value: { processed: 0, errors: 0, totalLatency: 0, count: 0, lastWindowStart: Date.now(), windowCount: 0 }
    };
    // Adapter Metrics - ALL THE ADAPTERS
    private _adapterMetrics = new Map<string, {
        total: number;
        failures: number;
        totalLatency: number;
        count: number;
        lastHit: number;
        floodGateProcessed: number;
        lastWindowStart: number;
        windowCount: number;
    }>();
    // Backpressure Metrics
    private _backpressureMetrics = {
        throttleCount: 0,
        lastThrottle: 0,
        totalBackpressureEvents: 0,
        currentThrottleDuration: 0
    };
    // Channel Metrics
    private _channelMetrics = new Map<string, {
        messages: number;
        lastMessage: number;
        handlers: number;
    }>();
    // Feature Usage Metrics
    private _featureMetrics = {
        beacon: 0,
        radar: 0,
        vessel: 0,
        dock: 0,
        convoy: 0,
        sonar: 0,
        heartbeat: 0,
        watchdog: 0,
        floodGate: 0,
        pipeline: 0,
        tide: 0,
        mesh: 0,
        crdt: 0,
        synapse: 0,
        transaction: 0,
        circuitBreaker: 0,
        rateLimit: 0,
        plinko: 0,
        gateMaster: 0,
        saga: 0,
        ecs: 0,
        reactor: 0
    };
    private _eventLoopLag = 0;
    private _lagMeasurements: number[] = [];
    private traces = new Map<string, MessageTrace>();
    private readonly MAX_TRACES = 2000; // ring buffer — oldest evicted first
    private traceOrder: string[] = [];
    // #endregion
    // #region ███ CONSTRUCTOR ██████████████████████████████████████
    constructor() {
        // Measure event loop lag periodically
        setInterval(() => {
            const start = Date.now();
            Promise.resolve().then(() => {
                this._eventLoopLag = Date.now() - start;
                this._lagMeasurements.push(this._eventLoopLag);
                if (this._lagMeasurements.length > 100) {
                    this._lagMeasurements.shift();
                }
            });
        }, 1000);
    }
    // #endregion
    // #region ███ RECORD METHODS ██████████████████████████████████████
    recordQueue(action: 'enqueue' | 'dequeue' | 'drop' | 'process' | 'drain', duration?: number) {
        const now = Date.now();
        switch (action) {
            case 'enqueue':
                this._queueMetrics.totalEnqueued++;
                this._queueMetrics.currentSize++;
                if (this._queueMetrics.currentSize > this._queueMetrics.peakSize) {
                    this._queueMetrics.peakSize = this._queueMetrics.currentSize;
                }
                break;
            case 'dequeue':
            case 'process':
                this._queueMetrics.currentSize = Math.max(0, this._queueMetrics.currentSize - 1);
                if (action === 'process') {
                    this._queueMetrics.totalProcessed++;
                }
                break;
            case 'drop':
                this._queueMetrics.totalDropped++;
                this._queueMetrics.currentSize = Math.max(0, this._queueMetrics.currentSize - 1);
                break;
            case 'drain':
                this._queueMetrics.drainCount++;
                if (duration) {
                    this._queueMetrics.totalDrainTime += duration;
                }
                break;
        }

        // Track average queue depth
        this._queueMetrics.depthSamples++;
        this._queueMetrics.avgQueueDepth =
            (this._queueMetrics.avgQueueDepth * (this._queueMetrics.depthSamples - 1) + this._queueMetrics.currentSize) /
            this._queueMetrics.depthSamples;
    }
    recordFloodGate(gateNumber: 1 | 2 | 3 | 4, latency: number, error?: Error) {
        const gateKey = `gate${gateNumber}` as const;
        const gate = this._floodGateMetrics[gateKey];
        gate.hits++;
        gate.lastHit = Date.now();
        gate.totalLatency += latency;
        gate.count++;
        if (error) {
            gate.errors++;
            this._floodGateMetrics.totalErrors++;
        }

        this._floodGateMetrics.totalHits++;
        this._floodGateMetrics.totalLatency += latency;
        this._floodGateMetrics.latencyCount++;
        this._floodGateMetrics.windowHits++;

        // Reset window every second
        const now = Date.now();
        if (now - this._floodGateMetrics.lastWindowStart > 1000) {
            this._floodGateMetrics.lastWindowStart = now;
            this._floodGateMetrics.windowHits = 0;
        }
    }
    recordLane(lane: 'normal' | 'signal' | 'binary' | 'signal_save_value', latency: number, error?: Error) {
        const metrics = this._laneMetrics[lane];
        metrics.processed++;
        metrics.totalLatency += latency;
        metrics.count++;
        metrics.windowCount++;
        if (error) metrics.errors++;

        // Reset window every second
        const now = Date.now();
        if (now - metrics.lastWindowStart > 1000) {
            metrics.lastWindowStart = now;
            metrics.windowCount = 0;
        }
    }
    recordAdapter(id: string, latency: number, isFloodGate = false, error?: Error) {
        let metrics = this._adapterMetrics.get(id);
        if (!metrics) {
            metrics = {
                total: 0,
                failures: 0,
                totalLatency: 0,
                count: 0,
                lastHit: 0,
                floodGateProcessed: 0,
                lastWindowStart: Date.now(),
                windowCount: 0
            };
            this._adapterMetrics.set(id, metrics);
        }

        metrics.total++;
        metrics.totalLatency += latency;
        metrics.count++;
        metrics.lastHit = Date.now();
        metrics.windowCount++;
        if (isFloodGate) metrics.floodGateProcessed++;
        if (error) metrics.failures++;
    }
    recordBackpressure(throttled: boolean, duration?: number) {
        if (throttled) {
            this._backpressureMetrics.throttleCount++;
            this._backpressureMetrics.lastThrottle = Date.now();
            this._backpressureMetrics.totalBackpressureEvents++;
            if (duration) {
                this._backpressureMetrics.currentThrottleDuration = duration;
            }
        }
    }
    recordChannel(rt: string, handlerCount?: number) {
        let metrics = this._channelMetrics.get(rt);
        if (!metrics) {
            metrics = { messages: 0, lastMessage: 0, handlers: 0 };
            this._channelMetrics.set(rt, metrics);
        }
        metrics.messages++;
        metrics.lastMessage = Date.now();
        if (handlerCount !== undefined) {
            metrics.handlers = handlerCount;
        }
    }
    recordFeature(feature: keyof typeof this._featureMetrics) {
        this._featureMetrics[feature]++;
    }
    // #endregion
    // #region ███ SNAPSHOT █████████████████████████████████████████████
    snapshot(
        queueSize: number,
        maxQueueSize: number,
        openGates: number,
        throttled: boolean,
        adapters: Set<any>,
        channels: Map<string, Set<any>>
    ): MetricsSnapshot {
        const now = Date.now();
        const windowSeconds = 1;

        // Calculate throughputs
        const floodGateThroughput = this._floodGateMetrics.windowHits / windowSeconds;
        const laneThroughput = {
            normal: this._laneMetrics.normal.windowCount / windowSeconds,
            signal: this._laneMetrics.signal.windowCount / windowSeconds,
            binary: this._laneMetrics.binary.windowCount / windowSeconds,
            signal_save_value: this._laneMetrics.signal_save_value.windowCount / windowSeconds
        };

        // Calculate adapter metrics
        const adapterMetricsArray: Array<{
            id: string;
            total: number;
            failures: number;
            avgLatency: number;
            throughput: number;
            errorRate: number;
            healthy: boolean;
            floodGateProcessed: number;
        }> = [];

        for (const [id, metrics] of this._adapterMetrics) {
            const avgLatency = metrics.count > 0 ? metrics.totalLatency / metrics.count : 0;
            const errorRate = metrics.total > 0 ? metrics.failures / metrics.total : 0;
            const throughput = metrics.windowCount / windowSeconds;

            adapterMetricsArray.push({
                id,
                total: metrics.total,
                failures: metrics.failures,
                avgLatency,
                throughput,
                errorRate,
                healthy: errorRate < 0.5 && metrics.total > 0,
                floodGateProcessed: metrics.floodGateProcessed
            });
        }

        // Sort adapters by total
        adapterMetricsArray.sort((a, b) => b.total - a.total);

        // Get top channels
        const topChannels = Array.from(this._channelMetrics.entries())
            .map(([name, metrics]) => ({ name, count: metrics.messages }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const activeHandlers = Array.from(channels.values()).reduce((sum, set) => sum + set.size, 0);

        const snapshot: MetricsSnapshot = {
            timestamp: now,
            nodeId: this._nodeId,
            uptime: now - this._startTime,

            queue: {
                currentSize: queueSize,
                maxSize: maxQueueSize,
                fillPercent: maxQueueSize > 0 ? (queueSize / maxQueueSize) * 100 : 0,
                peakSize: this._queueMetrics.peakSize,
                totalEnqueued: this._queueMetrics.totalEnqueued,
                totalDropped: this._queueMetrics.totalDropped,
                totalProcessed: this._queueMetrics.totalProcessed,
                drainCount: this._queueMetrics.drainCount,
                avgDrainTime: this._queueMetrics.drainCount > 0 ?
                    this._queueMetrics.totalDrainTime / this._queueMetrics.drainCount : 0,
                deadLetterSize: this._queueMetrics.deadLetterSize
            },

            floodGates: {
                openGates,
                gate1: {
                    hits: this._floodGateMetrics.gate1.hits,
                    errors: this._floodGateMetrics.gate1.errors,
                    lastHit: this._floodGateMetrics.gate1.lastHit,
                    avgLatency: this._floodGateMetrics.gate1.count > 0 ?
                        this._floodGateMetrics.gate1.totalLatency / this._floodGateMetrics.gate1.count : 0
                },
                gate2: {
                    hits: this._floodGateMetrics.gate2.hits,
                    errors: this._floodGateMetrics.gate2.errors,
                    lastHit: this._floodGateMetrics.gate2.lastHit,
                    avgLatency: this._floodGateMetrics.gate2.count > 0 ?
                        this._floodGateMetrics.gate2.totalLatency / this._floodGateMetrics.gate2.count : 0
                },
                gate3: {
                    hits: this._floodGateMetrics.gate3.hits,
                    errors: this._floodGateMetrics.gate3.errors,
                    lastHit: this._floodGateMetrics.gate3.lastHit,
                    avgLatency: this._floodGateMetrics.gate3.count > 0 ?
                        this._floodGateMetrics.gate3.totalLatency / this._floodGateMetrics.gate3.count : 0
                },
                gate4: {
                    hits: this._floodGateMetrics.gate4.hits,
                    errors: this._floodGateMetrics.gate4.errors,
                    lastHit: this._floodGateMetrics.gate4.lastHit,
                    avgLatency: this._floodGateMetrics.gate4.count > 0 ?
                        this._floodGateMetrics.gate4.totalLatency / this._floodGateMetrics.gate4.count : 0
                },
                totalHits: this._floodGateMetrics.totalHits,
                totalErrors: this._floodGateMetrics.totalErrors,
                bypassRate: this._floodGateMetrics.totalHits + this._floodGateMetrics.queued > 0 ?
                    (this._floodGateMetrics.totalHits / (this._floodGateMetrics.totalHits + this._floodGateMetrics.queued)) * 100 : 0,
                avgLatency: this._floodGateMetrics.latencyCount > 0 ?
                    this._floodGateMetrics.totalLatency / this._floodGateMetrics.latencyCount : 0,
                throughputPerSecond: floodGateThroughput
            },

            lanes: {
                normal: {
                    processed: this._laneMetrics.normal.processed,
                    avgLatency: this._laneMetrics.normal.count > 0 ?
                        this._laneMetrics.normal.totalLatency / this._laneMetrics.normal.count : 0,
                    errors: this._laneMetrics.normal.errors,
                    throughput: laneThroughput.normal
                },
                signal: {
                    processed: this._laneMetrics.signal.processed,
                    avgLatency: this._laneMetrics.signal.count > 0 ?
                        this._laneMetrics.signal.totalLatency / this._laneMetrics.signal.count : 0,
                    errors: this._laneMetrics.signal.errors,
                    throughput: laneThroughput.signal
                },
                binary: {
                    processed: this._laneMetrics.binary.processed,
                    avgLatency: this._laneMetrics.binary.count > 0 ?
                        this._laneMetrics.binary.totalLatency / this._laneMetrics.binary.count : 0,
                    errors: this._laneMetrics.binary.errors,
                    throughput: laneThroughput.binary
                },
                signal_save_value: {
                    processed: this._laneMetrics.signal_save_value.processed,
                    avgLatency: this._laneMetrics.signal_save_value.count > 0 ?
                        this._laneMetrics.signal_save_value.totalLatency / this._laneMetrics.signal_save_value.count : 0,
                    errors: this._laneMetrics.signal_save_value.errors,
                    throughput: laneThroughput.signal_save_value
                }
            },

            adapters: adapterMetricsArray.slice(0, 20),

            backpressure: {
                throttled,
                throttleCount: this._backpressureMetrics.throttleCount,
                lastThrottle: this._backpressureMetrics.lastThrottle,
                avgQueueDepth: this._queueMetrics.avgQueueDepth,
                maxQueueDepth: this._queueMetrics.peakSize,
                totalBackpressureEvents: this._backpressureMetrics.totalBackpressureEvents
            },

            channels: {
                total: channels.size,
                activeSubs: activeHandlers,
                totalMessages: Array.from(this._channelMetrics.values()).reduce((sum, m) => sum + m.messages, 0),
                topChannels
            },

            system: {
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                eventLoopLag: this._eventLoopLag,
                activeHandlers,
                pendingRequests: this._queueMetrics.currentSize
            },

            features: { ...this._featureMetrics }
        };

        // Store snapshot
        this._snapshots.push(snapshot);
        if (this._snapshots.length > this._maxSnapshots) {
            this._snapshots.shift();
        }

        return snapshot;
    }
    // #endregion
    // #region ███ QUERY METHODS ████████████████████████████████████████
    getHistory(limit?: number): MetricsSnapshot[] {
        return limit ? this._snapshots.slice(-limit) : this._snapshots;
    }
    getLatest(): MetricsSnapshot | null {
        return this._snapshots[this._snapshots.length - 1] || null;
    }
    getMetricsSummary() {
        const latest = this.getLatest();
        if (!latest) return null;

        return {
            totalMessages: latest.queue.totalProcessed + latest.queue.totalDropped,
            totalErrors: latest.floodGates.totalErrors + latest.lanes.normal.errors + latest.lanes.signal.errors + latest.lanes.binary.errors + latest.lanes.signal_save_value.errors,
            avgLatency: latest.floodGates.avgLatency,
            throughput: latest.floodGates.throughputPerSecond,
            queuePressure: latest.queue.fillPercent,
            activeAdapters: latest.adapters.length,
            features: latest.features
        };
    }
    // #endregion
    // #region ███ STREAM DATA FOR DASHBOARD ███████████████████████████
    getStreamData() {
        const latest = this.getLatest();
        if (!latest) return null;

        return {
            ...latest,
            adapters: latest.adapters,
            history: this._snapshots.slice(-30).map(s => ({
                timestamp: s.timestamp,
                queueSize: s.queue.currentSize,
                openGates: s.floodGates.openGates,
                throughput: s.floodGates.throughputPerSecond,
                avgLatency: s.floodGates.avgLatency,
                errors: s.floodGates.totalErrors
            }))
        };
    }
    // #endregion
    // #region ███ RESET █████████████████████████████████████████████████
    reset() {
        this._startTime = Date.now();
        this._snapshots = [];
        this._queueMetrics = {
            totalEnqueued: 0,
            totalDropped: 0,
            totalProcessed: 0,
            peakSize: 0,
            currentSize: 0,
            drainCount: 0,
            totalDrainTime: 0,
            deadLetterSize: 0,
            avgQueueDepth: 0,
            depthSamples: 0
        };
        this._floodGateMetrics = {
            gate1: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
            gate2: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
            gate3: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
            gate4: { hits: 0, errors: 0, lastHit: 0, totalLatency: 0, count: 0 },
            totalHits: 0,
            totalErrors: 0,
            totalLatency: 0,
            latencyCount: 0,
            bypassed: 0,
            queued: 0,
            lastWindowStart: Date.now(),
            windowHits: 0
        };
        this._adapterMetrics.clear();
        this._channelMetrics.clear();
        Object.keys(this._featureMetrics).forEach(key => {
            this._featureMetrics[key as keyof typeof this._featureMetrics] = 0;
        });
    }
    // #endregion
    // #region ███ PER MSG TRACING █████████████████████████████████████████████████
    private getOrCreateTrace(id: string, rt: string, ms?: string): MessageTrace {
        let t = this.traces.get(id);
        if (!t) {
            t = { id, rt, ms, createdAt: Date.now(), stages: [] };
            this.traces.set(id, t);
            this.traceOrder.push(id);
            if (this.traceOrder.length > this.MAX_TRACES) {
                const evict = this.traceOrder.shift();
                if (evict) this.traces.delete(evict);
            }
        }
        return t;
    }
    // Call at the start of any stage a message passes through.
    traceStage(id: string, rt: string, stage: StageName, detail?: Record<string, unknown>, ms?: string) {
        const t = this.getOrCreateTrace(id, rt, ms);
        const prev = t.stages[t.stages.length - 1];
        const now = Date.now();
        if (prev && prev.durationMs === undefined) {
            prev.durationMs = now - prev.ts; // close out the previous open stage
        }
        t.stages.push({ stage, ts: now, detail });
    }
    traceLane(id: string, lane: LaneName) {
        const t = this.traces.get(id);
        if (t) t.lane = lane;
    }
    traceGate(id: string, gate: GateNumber) {
        const t = this.traces.get(id);
        if (t) t.gate = gate;
    }
    traceAdapter(id: string, adapterId: string) {
        const t = this.traces.get(id);
        if (t) t.adapterId = adapterId;
    }
    tracePayloadSize(id: string, bytes: number) {
        const t = this.traces.get(id);
        if (t) t.payloadSize = bytes;
    }
    // Call when a message reaches a terminal state.
    finishTrace(id: string, outcome: MessageTrace['outcome']) {
        const t = this.traces.get(id);
        if (!t) return;
        const now = Date.now();
        const last = t.stages[t.stages.length - 1];
        if (last && last.durationMs === undefined) last.durationMs = now - last.ts;
        t.finishedAt = now;
        t.totalMs = now - t.createdAt;
        t.outcome = outcome;
    }
    // #endregion
    // #region ███ query surface for consumers █████████████████████████████████████████████████
    getMessageTrace(id: string): MessageTrace | null {
        return this.traces.get(id) ?? null;
    }
    getRecentTraces(limit = 100): MessageTrace[] {
        return this.traceOrder.slice(-limit).map(id => this.traces.get(id)!).filter(Boolean);
    }
    getTracesByChannel(rt: string, limit = 100): MessageTrace[] {
        const out: MessageTrace[] = [];
        for (let i = this.traceOrder.length - 1; i >= 0 && out.length < limit; i--) {
            const t = this.traces.get(this.traceOrder[i]);
            if (t && t.rt === rt) out.push(t);
        }
        return out;
    }
    getTracesByAdapter(adapterId: string, limit = 100): MessageTrace[] {
        const out: MessageTrace[] = [];
        for (let i = this.traceOrder.length - 1; i >= 0 && out.length < limit; i--) {
            const t = this.traces.get(this.traceOrder[i]);
            if (t && t.adapterId === adapterId) out.push(t);
        }
        return out;
    }
    getTracesByOutcome(outcome: MessageTrace['outcome'], limit = 100): MessageTrace[] {
        const out: MessageTrace[] = [];
        for (let i = this.traceOrder.length - 1; i >= 0 && out.length < limit; i--) {
            const t = this.traces.get(this.traceOrder[i]);
            if (t && t.outcome === outcome) out.push(t);
        }
        return out;
    }
    // #endregion


}
