// #region ███████████████ YMIR ████████████████████████████████████████████████████████
export class YMIR {
    key;
    opts;
    serverValue = null;
    localValue = null;
    serverVersion = 0;
    staff;
    listeners = new Set();
    lastPrefetch = 0;
    constructor(staff, key, opts = {}) {
        this.key = key;
        this.opts = opts;
    }
    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }
    notify(value) {
        this.listeners.forEach(fn => fn(value));
    }
    shouldPrefetch() {
        const threshold = this.opts.prefetchThreshold ?? 30_000;
        return Date.now() - this.lastPrefetch > threshold;
    }
    async write(newValue, options) {
        this.localValue = newValue;
        if (options.optimistic)
            this.notify(newValue);
        const attempts = this.opts.retry?.maxAttempts ?? 3;
        const baseDelay = this.opts.retry?.baseDelay ?? 1000;
        const maxDelay = this.opts.retry?.maxDelay ?? 10_000;
        const backoff = this.opts.retry?.backoff ?? 'exponential';
        let lastErr = null;
        for (let attempt = 0; attempt < attempts; attempt++) {
            try {
                const result = await options.fetcher(newValue);
                const resolved = this.resolve(newValue, result);
                this.localValue = resolved;
                this.serverValue = result;
                this.notify(resolved);
                this.staff.sse.sseSet(this.key, resolved);
                this.staff.send(`[THE_WIZARD]`, `sse:${this.key}`, { data: resolved });
                return resolved;
            }
            catch (e) {
                lastErr = e;
                if (attempt < attempts - 1) {
                    const delay = backoff === 'exponential'
                        ? Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
                        : backoff === 'linear'
                            ? Math.min(baseDelay * (attempt + 1), maxDelay)
                            : baseDelay;
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }
        if (!options.optimistic && this.serverValue !== null)
            this.notify(this.serverValue);
        throw lastErr;
    }
    resolve(local, server) {
        const strategy = this.opts.conflictStrategy ?? 'server-wins';
        if (strategy === 'client-wins')
            return local;
        if (strategy === 'server-wins')
            return server;
        if (strategy === 'merge' && this.opts.mergeFn)
            return this.opts.mergeFn(local, server);
        if (strategy === 'version') {
            const field = this.opts.versionField ?? 'version';
            const lv = local[field] ?? 0;
            const sv = server[field] ?? 0;
            return lv >= sv ? local : server;
        }
        return server;
    }
}
// #endregion
