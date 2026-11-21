
export class PlinkoSession<TState = any, TPayload = any> {
    private currentNodeMap: PlinkoTree<TState, TPayload>;
    private readonly rootTree: PlinkoTree<TState, TPayload>;
    private state: TState;
    private currentPath: string[] = [];
    private readonly metadata = new Map<string, any>();
    private aborted = false;

    constructor(
        initialState: TState,
        tree: PlinkoTree<TState, TPayload>,
        private readonly options: PlinkoOptions<TState, TPayload> = {}
    ) {
        this.rootTree = tree;
        this.currentNodeMap = tree;
        this.state = initialState;
    }

    public getState(): TState {
        return this.state;
    }

    public getPath(): string[] {
        return [...this.currentPath];
    }

    public reset(): void {
        this.currentNodeMap = this.rootTree;
        this.currentPath = [];
        this.metadata.clear();
        this.aborted = false;
    }

    public async evaluate(p: TPayload, replyFn: (data: unknown, targetSc?: string) => Promise<unknown>): Promise<{ success: boolean; path: string[]; result?: any; terminal: boolean }> {
        if (this.aborted) {
            return { success: false, path: this.currentPath, result: new Error('Plinko session aborted'), terminal: true };
        }

        const pathTracker = [...this.currentPath];
        let matchedNode: { name: string; node: PlinkoNode<TState, TPayload> } | null = null;

        const ctx: PlinkoContext<TState, TPayload> = {
            state: this.state,
            p,
            path: pathTracker,
            metadata: this.metadata,
            reply: replyFn,
            abort: (reason = 'Explicitly aborted') => {
                this.aborted = true;
                throw new Error(reason);
            }
        };

        // Find matching node in the *current active tier width*
        for (const [nodeName, node] of Object.entries(this.currentNodeMap)) {
            try {
                const isMatch = await node.matcher(p, ctx);
                if (isMatch) {
                    matchedNode = { name: nodeName, node };
                    break;
                }
            } catch (err) {
                if (this.options.onError) {
                    this.options.onError(err, [...pathTracker, nodeName], p);
                }
                return { success: false, path: pathTracker, result: err, terminal: false };
            }
        }

        if (!matchedNode) {
            return { success: false, path: pathTracker, result: { error: 'No matching branch found for current tier' }, terminal: false };
        }

        const { name, node } = matchedNode;
        const nextPath = [...pathTracker, name];

        try {
            if (node.hooks?.beforeEnter) {
                await node.hooks.beforeEnter(p, ctx);
            }

            let executionResult: any = undefined;
            if (node.execute) {
                executionResult = await node.execute(p, ctx);
            }

            if (node.hooks?.afterExit) {
                await node.hooks.afterExit(executionResult, ctx);
            }

            if (this.options.onTransition) {
                this.options.onTransition(pathTracker, nextPath, p);
            }

            this.currentPath = nextPath;

            const hasSubBranches = !!node.branches && Object.keys(node.branches).length > 0;
            if (hasSubBranches) {
                this.currentNodeMap = node.branches!;
            } else if (this.options.autoResetOnTerminal ?? false) {
                this.reset();
            }

            return {
                success: true,
                path: nextPath,
                result: executionResult,
                terminal: !hasSubBranches
            };
        } catch (err) {
            if (this.options.onError) {
                this.options.onError(err, nextPath, p);
            }
            return { success: false, path: nextPath, result: err, terminal: false };
        }
    }
}
