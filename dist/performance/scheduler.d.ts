export interface Task {
    cancel(): void;
    reprioritize(next: Priority): void;
}
export interface ScheduledTask {
    priority: Priority;
    scope: symbol | string;
    fn: () => void;
    signal?: AbortSignal;
    cancelled: boolean;
}
export type Priority = 'immediate' | 'user-blocking' | 'normal' | 'background' | 'idle';
export type BatchScope = symbol;
export type FlushCallback = () => void;
export declare const PRIORITY_ORDER: Priority[];
export declare const GLOBAL_SCOPE: unique symbol;
export declare function enqueue(task: ScheduledTask): void;
export declare function scheduleLoop(): void;
export declare function pickNext(): ScheduledTask | undefined;
export declare function schedule(fn: () => void, opts?: {
    priority?: Priority;
    scope?: string;
    signal?: AbortSignal;
}): Task;
export declare function withRequestScope<T>(requestId: string, fn: () => T): T;
export declare function yieldToScheduler(): Promise<void>;
export declare function scheduleChunked(work: Iterable<() => void> | Iterator<() => void>, opts?: {
    priority?: Priority;
    scope?: string;
    chunkBudgetMs?: number;
}): Task;
export declare function microtask(fn: FlushCallback): void;
export declare function batch<T>(fn: () => T): T;
export declare function openBatch(): BatchScope;
export declare function closeBatch(scope: BatchScope): void;
export declare function isBatching(): boolean;
export declare function onFlush(cb: FlushCallback): void;
export declare function flushSync(): void;
export declare function flush<T>(fn?: () => T): T | void;
