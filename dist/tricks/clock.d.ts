type SCHEDULER_FN = {
    (s: Scheduler): Scheduler;
    immediate: Scheduler;
    userBlocking: Scheduler;
    normal: Scheduler;
    background: Scheduler;
    idle: Scheduler;
    macrotask: Scheduler;
    microtask: Scheduler;
    schedule: typeof schedule;
    scheduleChunked: typeof scheduleChunked;
    yieldToScheduler: typeof yieldToScheduler;
    withRequestScope: typeof withRequestScope;
    Priority: {
        order: typeof PRIORITY_ORDER;
    };
};
interface Clock {
    now(): N;
    schedule(fn: () => V, delay: N, signal?: AbortSignal): Task;
    dispose(): V;
}
export interface Task {
    cancel(): V;
    reprioritize(next: Priority): V;
}
export interface ScheduledTask {
    priority: Priority;
    scope: SY | S;
    fn: () => N;
    signal?: AbortSignal;
    cancelled: B;
}
export type Priority = "immediate" | "user-blocking" | "normal" | "background" | "idle";
export type BatchScope = SY;
export type FlushCallback = () => V;
export declare const PRIORITY_ORDER: Priority[];
export declare const GLOBAL_SCOPE: unique symbol;
export declare function enqueue(task: ScheduledTask): V;
export declare function scheduleLoop(): V;
export declare function pickNext(): ScheduledTask | UD;
export declare function schedule(fn: () => V, opts?: {
    priority?: Priority;
    scope?: S;
    signal?: AbortSignal;
}): Task;
export declare function withRequestScope<T>(requestId: S, fn: () => T): T;
export declare function yieldToScheduler(): P<V>;
export declare function scheduleChunked(work: Iterable<() => V> | Iterator<() => V>, opts?: {
    priority?: Priority;
    scope?: S;
    chunkBudgetMs?: N;
}): Task;
export declare function microtask(fn: FlushCallback): void;
export declare function batch<T>(fn: () => T): T;
export declare function openBatch(): BatchScope;
export declare function closeBatch(scope: BatchScope): V;
export declare function isBatching(): B;
export declare function onFlush(cb: FlushCallback): V;
export declare function flushSync(): void;
export declare function flush<T>(fn?: () => T): T | V;
export declare class CLOCK {
    private _activeClock;
    private _virtualClock;
    constructor();
    defaultClock: Clock;
    getDefaultClock(): Clock;
    refreshDefaultClock(): void;
    getVirtualClock(): Clock;
    refreshVirtualClock(): void;
    noop: {
        cancel(): void;
        reprioritize(): void;
    };
    _scheduler: {
        sync: {
            now: () => number;
            schedule: (fn: () => V) => Task;
        };
        microtask: {
            now: () => number;
            schedule: (fn: () => V) => Task;
        };
        macrotask: {
            now: () => number;
            schedule: (fn: () => V, delay?: number | undefined) => Task;
        };
        animationFrame: Scheduler;
        bun: Scheduler;
        custom(s: Scheduler): Scheduler;
    };
    asScheduler(defaults?: {
        priority?: Priority;
        scope?: S;
    }): Scheduler;
    scheduler: SCHEDULER_FN;
}
export declare class REAL_CLOCK implements Clock {
    private _scheduler;
    private _tasks;
    private _disposed;
    constructor(_scheduler?: typeof schedule);
    now(): N;
    schedule(fn: () => V, delay: N, signal?: AbortSignal): Task;
    dispose(): V;
}
export declare class VIRTUAL_CLOCK implements Clock {
    private _t;
    private _q;
    private _seq;
    now(): number;
    schedule(fn: () => V, delay: N, signal?: AbortSignal): Task;
    tick(ms: N): P<V>;
    tickTo(t: N): Promise<void>;
    runAll(): P<V>;
    private _drainMicrotasks;
    dispose(): V;
}
export declare class SCHEDULER extends VIRTUAL_CLOCK {
    private _realSchedulerDrained;
    tick(ms: N): P<V>;
    tickTo(t: N): P<V>;
    runAll(): P<V>;
    private _drainReal;
    private _hasPending;
}
export {};
