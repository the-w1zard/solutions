export declare class PlinkoSession<TState = any, TPayload = any> {
    private readonly options;
    private currentNodeMap;
    private readonly rootTree;
    private state;
    private currentPath;
    private readonly metadata;
    private aborted;
    constructor(initialState: TState, tree: PlinkoTree<TState, TPayload>, options?: PlinkoOptions<TState, TPayload>);
    getState(): TState;
    getPath(): string[];
    reset(): void;
    evaluate(p: TPayload, replyFn: (data: unknown, targetSc?: string) => Promise<unknown>): Promise<{
        success: boolean;
        path: string[];
        result?: any;
        terminal: boolean;
    }>;
}
