
type DeferredKey = string;
type DeferredState = 'pending' | 'running';

type DeferredTask = {
    id: number;
    deps: DeferredKey[];
    fn: (...v: any[]) => any;
    state: DeferredState;
};

type DeferredEntry = {
    v: any;
    version: number;
};

type DeferredStats = {
    registered: number;
    executed: number;
    completed: number;
    failed: number;
    cancelled: number;
};

export class DEFER_ENGINE {

       /**   public t: any = {}
          private _useRifts() {
            return disruptor.useSClass.mailbox(this, 'MAELSTROM', 'RIFTS', disruptor.ms, disruptor.rt);
        }
        constructor() { 
            const [v, setV] = this._useRifts()
            setPrev(setV, this)
            this.t = v
            useEffect(() => { this.t = v }, [v])
         }

            public root: A
    constructor(root: A = null) { this.root = root }
    public FULFIL_THIS_NOW(r: A) { this.root = r }
      public  REFRESH_ROOT() { return this.root.acquire_root('CONJURE_MODULES') }
 */
     
    
    private deps = new Map<DeferredKey, DeferredEntry>();
    private tasks = new Map<number, DeferredTask>();
    private nextId = 0;
    private draining = false;
    private drainAgain = false;

    private stats: DeferredStats = {
        registered: 0,
        executed: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
    };
    private onError: (e: unknown, id: number, deps: DeferredKey[]) => void = (e, id, deps) => {
        console.error('[DEFERRED] Task failed', { id, deps, error: e });
    }
    private onSuccess: (id: number, deps: DeferredKey[]) => void = (id, deps) => {
        console.log('[DEFERRED] Task fulfilled', { id, deps });
    }
    // Register work. Executes immediately if every dependency is ready.
    public run(deps: DeferredKey | DeferredKey[], fn: (...v: any[]) => any): number {
        const keys = [...new Set(typeof deps === 'string' ? [deps] : deps)];
        const id = ++this.nextId;
        this.stats.registered++;
        this.tasks.set(id, { id, deps: keys, fn, state: 'pending', });
        this.drain();
        return id;
    }
    // Publish or replace a dependency's value.

    public provide(k: DeferredKey, v: any): void;
    public provide(deps: Record<DeferredKey, any>): void;

    public provide(
        k: DeferredKey | Record<DeferredKey, any>,
        v?: any
    ): void {
        const entries: [DeferredKey, any][] =
            typeof k === 'string'
                ? [[k, v]]
                : Object.entries(k);

        for (const [key, value] of entries) {
            const prev = this.deps.get(key);

            this.deps.set(key, {
                v: value,
                version: (prev?.version ?? 0) + 1,
            });
        }

        this.drain();
    }
    // Mark a dependency as available without a meaningful value.
    public resolve(k: DeferredKey): void { this.provide(k, undefined); }
    // Revoke availability. Already-dispatched work is unaffected.
    public invalidate(k: DeferredKey): boolean { return this.deps.delete(k); }
    public has(k: DeferredKey): boolean { return this.deps.has(k); }
    public get<T = any>(k: DeferredKey): T | undefined { return this.deps.get(k)?.v as T | undefined; }
    public cancel(id: number): boolean {
        const task = this.tasks.get(id);
        if (!task || task.state !== 'pending') return false;
        this.tasks.delete(id);
        this.stats.cancelled++;
        return true;
    }
    private ready(task: DeferredTask): boolean { return task.deps.every(k => this.deps.has(k)); }
    private drain(): void {
        if (this.draining) { this.drainAgain = true; return; }
        this.draining = true;
        try {
            do {
                this.drainAgain = false;
                for (const task of this.tasks.values()) {
                    if (task.state !== 'pending' || !this.ready(task)) { continue; }
                    // Claim before execution to prevent duplicate dispatch.
                    task.state = 'running';
                    this.stats.executed++;
                    const v = task.deps.map(k => this.deps.get(k)!.v);
                    try {
                        const result = task.fn(...v);
                        if (result != null && typeof result.then === 'function') {
                            Promise.resolve(result).then(() => { this.stats.completed++; this.onSuccess(task.id, task.deps); })
                                .catch(e => { this.stats.failed++; this.report(task, e); })
                                .finally(() => { this.tasks.delete(task.id); });
                        } else {
                            this.stats.completed++;
                            this.onSuccess(task.id, task.deps);
                            this.tasks.delete(task.id);
                        }
                    } catch (e) {
                        this.stats.failed++;
                        this.report(task, e);
                        this.tasks.delete(task.id);
                    }
                }
            } while (this.drainAgain);
        } finally {
            this.draining = false;
        }
    }
    private report(task: DeferredTask, e: unknown): void {
        try {
            this.onError(e, task.id, task.deps);
        } catch {
            // Error reporting must not interrupt the scheduler.
        }
    }
    public inspect() {
        const pending = [...this.tasks.values()].filter(t => t.state === 'pending').map(t => ({ id: t.id, deps: t.deps, missing: t.deps.filter(k => !this.deps.has(k)), }));
        const running = [...this.tasks.values()].filter(t => t.state === 'running').map(t => ({ id: t.id, deps: t.deps, }));
        return {
            stats: { ...this.stats },
            dependencies: [...this.deps.entries()].map(([k, e]) => ({ key: k, version: e.version, })),
            pending,
            running,
        };
    }
    public clear(): void {
        for (const [id, task] of this.tasks) {
            if (task.state === 'pending') {
                this.tasks.delete(id);
                this.stats.cancelled++;
            }
        }

        this.deps.clear();
    }
}

export const DEFER_ = new DEFER_ENGINE()

/**
defer.provide('DISPATCH_ENGINE._sub', this.DISRUPTOR_LVL2);


defer.run(['DISPATCH_ENGINE._sub', 'ATOM'],(d, atom) => {
    // Runs only when both dependencies are available.
});

defer.run('DISPATCH_ENGINE._sub', (d, atom) => {
    // Runs only when both dependencies are available.
});
DEV_LOG('ENGINE constructor', 'ENGINE');
DEV_LOG('Dispatch started', 'DISPATCH');

// Change destinations at runtime.
logger.setWriteToFile(false); // Console
logger.setWriteToFile(true);  // File

// Change the output file.
logger.setFilePath('./logs/hc-test.log');

// Wait for queued file writes, e.g. before a test exits.
await logger.flush();
 */

 