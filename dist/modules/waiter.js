export class WAITER_REGISTRY {
    root;
    constructor(root = null) { this.root = root; }
    FULFIL_THIS_NOW(r) { this.root = r; }
    REFRESH_ROOT() { return this.root.acquire_root('WAITER_REGISTRY'); }
    entries = new Map();
    byKey = new Map();
    nextId = 0;
    WAIT_FOR(deps, fn) {
        const keys = [...new Set(Array.isArray(deps) ? deps : [deps])];
        const id = ++this.nextId;
        const entry = {
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
    READY(k, v) {
        const ids = this.byKey.get(k);
        if (!ids)
            return;
        for (const id of [...ids]) {
            const entry = this.entries.get(id);
            if (!entry)
                continue;
            entry.ready.add(k);
            if (entry.ready.size !== entry.deps.length)
                continue;
            this.remove(id);
            try {
                entry.fn(v);
            }
            catch (e) {
                queueMicrotask(() => {
                    throw e;
                });
            }
        }
    }
    CANCEL_WAIT(id) {
        return this.remove(id);
    }
    remove(id) {
        const entry = this.entries.get(id);
        if (!entry)
            return false;
        this.entries.delete(id);
        for (const k of entry.deps) {
            const ids = this.byKey.get(k);
            if (!ids)
                continue;
            ids.delete(id);
            if (!ids.size)
                this.byKey.delete(k);
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
