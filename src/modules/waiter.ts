type WaiterDep = SignalKey | SignalKey[];

type WaiterFn<T = any> = (v?: T) => void;

type WaiterEntry = {
    id: number;
    deps: SignalKey[];
    fn: WaiterFn;
    ready: Set<SignalKey>;
};

export class WAITER_REGISTRY {
        public root: A
    constructor(root: A = null) { this.root = root }
    public FULFIL_THIS_NOW(r: A) { this.root = r }
      public  REFRESH_ROOT() { return this.root.acquire_root('WAITER_REGISTRY') }
    private entries = new Map<number, WaiterEntry>();
    private byKey = new Map<SignalKey, Set<number>>();
    private nextId = 0;

    public WAIT_FOR<T = any>(
        deps: WaiterDep,
        fn: WaiterFn<T>
    ): number {
        const keys = [...new Set(Array.isArray(deps) ? deps : [deps])];
        const id = ++this.nextId;

        const entry: WaiterEntry = {
            id,
            deps: keys,
            fn,
            ready: new Set(),
        };

        this.entries.set(id, entry);

        for (const k of keys) {
            let ids = this.byKey.get(k);

            if (!ids) {
                ids = new Set();
                this.byKey.set(k, ids);
            }

            ids.add(id);
        }

        return id;
    }

    public READY<T = any>(k: SignalKey, v?: T): void {
        const ids = this.byKey.get(k);
        if (!ids) return;

        for (const id of [...ids]) {
            const entry = this.entries.get(id);
            if (!entry) continue;

            entry.ready.add(k);

            if (entry.ready.size !== entry.deps.length) continue;

            this.remove(id);

            try {
                entry.fn(v);
            } catch (e) {
                queueMicrotask(() => {
                    throw e;
                });
            }
        }
    }

    public CANCEL_WAIT(id: number): boolean {
        return this.remove(id);
    }

    private remove(id: number): boolean {
        const entry = this.entries.get(id);
        if (!entry) return false;

        this.entries.delete(id);

        for (const k of entry.deps) {
            const ids = this.byKey.get(k);
            if (!ids) continue;

            ids.delete(id);
            if (!ids.size) this.byKey.delete(k);
        }

        return true;
    }
}

/**
 * 
public waiters = new WAITER_REGISTRY();
 * 
this.waiters.READY(atom.key, value);
 * 
waiters.WAIT_FOR('staff', () => {
    staff.initializeSomething();
});
 * 
waiters.WAIT_FOR(['staff', 'database'], () => {
    // Runs after both dependencies are ready.
});
 */
