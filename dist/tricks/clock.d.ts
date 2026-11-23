import { PRIORITY_ORDER, schedule, scheduleChunked, withRequestScope, yieldToScheduler } from "../performance/scheduler";
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
            schedule: (fn: () => V, delay?: number) => Task;
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
export {};
