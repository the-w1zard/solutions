class REACTIVE_STORE {
    records = new Map();
    listeners = new Map();
    get(key) { return this.records.get(key); }
    set(key, record) {
        this.records.set(key, record);
        const subs = this.listeners.get(key);
        if (subs)
            for (const l of [...subs]) {
                try {
                    l(record);
                }
                catch { /* one bad listener never kills the rest */ }
            }
    }
    sub(key, fn) {
        let subs = this.listeners.get(key);
        if (!subs) {
            subs = new Set();
            this.listeners.set(key, subs);
        }
        subs.add(fn);
        return () => {
            const s = this.listeners.get(key);
            if (!s)
                return;
            s.delete(fn);
            if (!s.size)
                this.listeners.delete(key);
        };
    }
    delete(key) { this.records.delete(key); this.listeners.delete(key); }
    clear() { this.records.clear(); this.listeners.clear(); }
    get size() { return this.records.size; }
}
export const STORE = new REACTIVE_STORE();
