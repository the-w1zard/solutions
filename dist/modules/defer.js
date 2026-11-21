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
    deps = new Map();
    tasks = new Map();
    nextId = 0;
    draining = false;
    drainAgain = false;
    stats = {
        registered: 0,
        executed: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
    };
    onError = (e, id, deps) => {
        console.error('[DEFERRED] Task failed', { id, deps, error: e });
    };
    onSuccess = (id, deps) => {
        console.log('[DEFERRED] Task fulfilled', { id, deps });
    };
    // Register work. Executes immediately if every dependency is ready.
    run(deps, fn) {
        const keys = [...new Set(typeof deps === 'string' ? [deps] : deps)];
        const id = ++this.nextId;
        this.stats.registered++;
        this.tasks.set(id, { id, deps: keys, fn, state: 'pending', });
        this.drain();
        return id;
    }
    provide(k, v) {
        const entries = typeof k === 'string'
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
    resolve(k) { this.provide(k, undefined); }
    // Revoke availability. Already-dispatched work is unaffected.
    invalidate(k) { return this.deps.delete(k); }
    has(k) { return this.deps.has(k); }
    get(k) { return this.deps.get(k)?.v; }
    cancel(id) {
        const task = this.tasks.get(id);
        if (!task || task.state !== 'pending')
            return false;
        this.tasks.delete(id);
        this.stats.cancelled++;
        return true;
    }
    ready(task) { return task.deps.every(k => this.deps.has(k)); }
    drain() {
        if (this.draining) {
            this.drainAgain = true;
            return;
        }
        this.draining = true;
        try {
            do {
                this.drainAgain = false;
                for (const task of this.tasks.values()) {
                    if (task.state !== 'pending' || !this.ready(task)) {
                        continue;
                    }
                    // Claim before execution to prevent duplicate dispatch.
                    task.state = 'running';
                    this.stats.executed++;
                    const v = task.deps.map(k => this.deps.get(k).v);
                    try {
                        const result = task.fn(...v);
                        if (result != null && typeof result.then === 'function') {
                            Promise.resolve(result).then(() => { this.stats.completed++; this.onSuccess(task.id, task.deps); })
                                .catch(e => { this.stats.failed++; this.report(task, e); })
                                .finally(() => { this.tasks.delete(task.id); });
                        }
                        else {
                            this.stats.completed++;
                            this.onSuccess(task.id, task.deps);
                            this.tasks.delete(task.id);
                        }
                    }
                    catch (e) {
                        this.stats.failed++;
                        this.report(task, e);
                        this.tasks.delete(task.id);
                    }
                }
            } while (this.drainAgain);
        }
        finally {
            this.draining = false;
        }
    }
    report(task, e) {
        try {
            this.onError(e, task.id, task.deps);
        }
        catch {
            // Error reporting must not interrupt the scheduler.
        }
    }
    inspect() {
        const pending = [...this.tasks.values()].filter(t => t.state === 'pending').map(t => ({ id: t.id, deps: t.deps, missing: t.deps.filter(k => !this.deps.has(k)), }));
        const running = [...this.tasks.values()].filter(t => t.state === 'running').map(t => ({ id: t.id, deps: t.deps, }));
        return {
            stats: { ...this.stats },
            dependencies: [...this.deps.entries()].map(([k, e]) => ({ key: k, version: e.version, })),
            pending,
            running,
        };
    }
    clear() {
        for (const [id, task] of this.tasks) {
            if (task.state === 'pending') {
                this.tasks.delete(id);
                this.stats.cancelled++;
            }
        }
        this.deps.clear();
    }
}
export const DEFER_ = new DEFER_ENGINE();
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
