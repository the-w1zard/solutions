export declare class OPTIMISTIC {
    private bus;
    private config;
    private events;
    private stacks;
    private snapshotSources;
    private reconcilers;
    private rt;
    private destroyed;
    constructor(bus: unknown, config?: OptimisticConfig);
    setSnapshotSource(pattern: string | RegExp, fn: (entityKey: string) => any): void;
    setReconciler(pattern: string | RegExp, fn: (predicted: any, actual: any) => any): void;
    apply<T = any>(entityKey: string, predict: Predictor<T>, meta?: {
        commandId?: string;
    }): string;
    confirm(mutationId: string, actual: unknown): void;
    fail(mutationId: string, error?: unknown): void;
    getState<T = any>(entityKey: string): T;
    isPending(entityKey: string): boolean;
    pendingCount(entityKey?: string): number;
    on<K extends keyof OPTIMISTICEventMap>(event: K, handler: (p: OPTIMISTICEventMap[K]) => void): () => void;
    destroy(): void;
    private getBase;
    private resolveReconciler;
    /** Folds base + mutations[0..index) — i.e. state as of just before `index`. */
    private foldUpTo;
    private locate;
    /** Once resolved mutations sit at the bottom of the stack with nothing pending above needing them, they can be dropped — the snapshot source is assumed to reflect them by then (e.g. kvdb/rdb already wrote the confirmed value). Only trims a resolved prefix, never touches still-pending entries. */
    private pruneResolvedTail;
    private handleRemoteMessage;
}
/**
 */
