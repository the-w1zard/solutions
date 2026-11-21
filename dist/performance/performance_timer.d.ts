interface TimingRecord {
    id: string;
    label: string;
    scopeId: string;
    parentId: string | null;
    start: number;
    end: number;
    duration: number;
    selfDuration: number;
    success: boolean;
    error?: string;
    checkpoints: {
        label: string;
        at: number;
        sinceStart: number;
        sinceLast: number;
    }[];
}
interface Gate {
    match: (timing: TimingRecord) => boolean;
    execute: (timing: TimingRecord) => void;
}
export declare class PERFORMANCE_TIMER {
    private staff?;
    private timings;
    private children;
    private recordHandlers;
    private gates;
    constructor(staff?: any | undefined);
    private currentScopeId;
    start(label: string, opts?: {
        scopeId?: string;
        parentId?: string;
        gates?: Gate[];
    }): string;
    /** Records a split without stopping the clock — pinpoints exactly where inside a function time went. */
    checkpoint(id: string, label: string): void;
    end(id: string, opts?: {
        success?: boolean;
        error?: any;
    }): void;
    /** start → run → end, catches and records errors automatically. */
    measure<T>(label: string, fn: (checkpoint: (label: string) => void) => Promise<T> | T, opts?: {
        scopeId?: string;
        parentId?: string;
        gates?: Gate[];
    }): Promise<T>;
    getTiming(id: string): {
        durationFormatted: string;
        selfDurationFormatted: string;
        id: string;
        label: string;
        scopeId: string;
        parentId: string | null;
        start: number;
        end: number;
        duration: number;
        selfDuration: number;
        success: boolean;
        error?: string;
        checkpoints: {
            label: string;
            at: number;
            sinceStart: number;
            sinceLast: number;
        }[];
    } | undefined;
    getChildren(parentId: string): TimingRecord[];
    getReport(label?: string): {
        count: number;
        successful: number;
        failed: number;
        min: number;
        max: number;
        avg: number;
        p50: number;
        p90: number;
        p99: number;
        minFormatted: string;
        maxFormatted: string;
        avgFormatted: string;
        p50Formatted: string;
        p90Formatted: string;
        p99Formatted: string;
    } | null;
    /** Trace Event Format — openable directly in chrome://tracing, Perfetto, speedscope. */
    exportTrace(label?: string): string;
    onRecord(handler: (timing: TimingRecord) => void): () => void;
    /** Wrap an SSR request entry point so every start() call inside it auto-scopes without manual threading. */
    runInScope<T>(requestId: string, fn: () => T): T;
}
export {};
