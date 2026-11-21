export declare class Queue {
    private options;
    private tasks;
    private running;
    private isPaused;
    private idleListeners;
    constructor(optionsOrConcurrent?: number | QueueOptions);
    run<T>(taskOrTasks: (() => Promise<T>) | (() => Promise<T>)[], taskOptions?: {
        priority?: number;
        label?: string;
    }): Promise<T | T[]>;
    private add;
    private process2;
    private process;
    private runTask;
    private executeWithRetry;
    private withTimeout;
    /** Resolves immediately if already idle, otherwise resolves the next time the queue fully empties. No polling. */
    onIdle(): Promise<void>;
    removeAt(index: number): void;
    moveUp(index: number): void;
    moveDown(index: number): void;
    moveToNext(index: number): void;
    moveToLast(index: number): void;
    start(): void;
    stop(): void;
    private maybeFireIdle;
    clear(): void;
    flush(): void;
    peek(): QueueTask<any>;
    peekAll(): QueueTask<any>[];
    getRunning(): QueueTask<any>[];
    get size(): number;
    get isEmpty(): boolean;
    get isRunning(): boolean;
    get isPausedState(): boolean;
    get pending(): number;
    get active(): number;
    setOptions(newOptions: Partial<QueueOptions>): void;
}
export declare function queue(options?: number | QueueOptions): QueueFunction;
export declare class TIERED_QUEUE {
    private config;
    private tiers;
    private tierOrder;
    private stagedTasks;
    private tierResults;
    constructor(config?: {
        defaultConcurrent?: number;
        retry?: number;
        timeout?: number;
        onTierComplete?: (tier: number, results: A[]) => void;
        onTierError?: (tier: number, error: Error) => void;
    });
    REG(tier: number, options?: TierOptions): this;
    ADD<T = A>(tier: N, label: S, task: () => P<T>, options?: TierOptions): P<T | UD>;
    ADD_BATCH<T>(tier: N, tasks: Array<{
        label: S;
        task: () => Promise<T>;
    }>, options?: TierOptions): P<(T | UD)[]>;
    execute(): Promise<Map<N, A[]>>;
    getStatus(): {
        tier: number;
        staged: number;
        pending: number;
        active: number;
        completed: number;
    }[];
    clear(): void;
}
