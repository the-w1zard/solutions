import { PRIORITY_ORDER, schedule, scheduleChunked, withRequestScope, yieldToScheduler } from "../performance/scheduler";
export class CLOCK {
    _activeClock;
    _virtualClock;
    constructor() {
        this._activeClock = new REAL_CLOCK();
        this._virtualClock = new VIRTUAL_CLOCK();
    }
    defaultClock = {
        now: () => this._activeClock.now(),
        schedule: (fn, delay, signal) => this._activeClock.schedule(fn, delay, signal),
        dispose: () => this._activeClock.dispose(),
    };
    getDefaultClock() {
        return this._activeClock;
    }
    refreshDefaultClock() {
        this._activeClock.dispose();
        this._activeClock = new REAL_CLOCK();
    }
    getVirtualClock() {
        return this._virtualClock;
    }
    refreshVirtualClock() {
        this._virtualClock.dispose();
        this._virtualClock = new VIRTUAL_CLOCK();
    }
    noop = {
        cancel() { },
        reprioritize() { },
    };
    _scheduler = {
        sync: {
            now: () => performance.now(),
            schedule: (fn) => {
                fn();
                return this.noop;
            },
        },
        microtask: {
            now: () => Date.now(),
            schedule: (fn) => {
                let cancelled = false;
                queueMicrotask(() => {
                    if (!cancelled)
                        fn();
                });
                return {
                    cancel: () => {
                        cancelled = true;
                    },
                    reprioritize() { },
                };
            },
        },
        macrotask: {
            now: () => Date.now(),
            schedule: (fn, delay = 0) => {
                const id = setTimeout(fn, delay);
                return {
                    cancel: () => clearTimeout(id),
                    reprioritize() { },
                };
            },
        },
        animationFrame: {
            now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
            schedule: (fn, delay) => {
                if (typeof requestAnimationFrame === "undefined") {
                    const id = setTimeout(fn, delay);
                    return { cancel: () => clearTimeout(id) };
                }
                let cancelled = false;
                const id = requestAnimationFrame(() => {
                    if (!cancelled)
                        fn();
                });
                return {
                    cancel: () => {
                        cancelled = true;
                        cancelAnimationFrame(id);
                    },
                };
            },
        },
        bun: {
            now: () => {
                const g = globalThis;
                if (g.Bun?.nanoseconds)
                    return Number(g.Bun.nanoseconds()) / 1e6;
                return Date.now();
            },
            schedule: (fn, delay) => {
                const g = globalThis;
                if (g.Bun?.sleep) {
                    let cancelled = false;
                    g.Bun.sleep(delay).then(() => {
                        if (!cancelled)
                            fn();
                    });
                    return {
                        cancel: () => {
                            cancelled = true;
                        },
                    };
                }
                const id = setTimeout(fn, delay);
                return { cancel: () => clearTimeout(id) };
            },
        },
        custom(s) {
            return s;
        },
    };
    asScheduler(defaults = {}) {
        return {
            now: () => performance.now(),
            schedule: (fn, delay = 0) => {
                let cancelled = false;
                let timer;
                let inner;
                const cancel = () => {
                    if (cancelled)
                        return;
                    cancelled = true;
                    if (timer !== undefined)
                        clearTimeout(timer);
                    inner?.cancel();
                };
                const submit = () => {
                    if (cancelled)
                        return;
                    try {
                        inner = schedule(() => {
                            if (cancelled)
                                return;
                            cancelled = true;
                            fn();
                        }, {
                            priority: defaults.priority ?? "normal",
                            scope: defaults.scope,
                        });
                    }
                    catch (e) {
                        cancel();
                        throw e;
                    }
                };
                if (!Number.isFinite(delay) || delay < 0) {
                    throw new RangeError("delay must be a finite number >= 0");
                }
                if (delay > 0)
                    timer = setTimeout(submit, delay);
                else
                    submit();
                return {
                    cancel,
                    reprioritize(p) {
                        inner?.reprioritize(p);
                    },
                };
            },
            postTask: (fn, options = {}) => {
                return new Promise((resolve, reject) => {
                    const signal = options.signal;
                    if (signal?.aborted) {
                        reject(signal.reason ?? new DOMException("The task was aborted.", "AbortError"));
                        return;
                    }
                    const priority = options.priority === "user-blocking" ? "user-blocking" :
                        options.priority === "background" ? "background" :
                            defaults.priority ?? "normal";
                    let timer;
                    let task;
                    let settled = false;
                    const cleanup = () => {
                        if (timer !== undefined)
                            clearTimeout(timer);
                        signal?.removeEventListener("abort", abort);
                    };
                    const abort = () => {
                        if (settled)
                            return;
                        settled = true;
                        cleanup();
                        task?.cancel();
                        reject(signal?.reason ?? new DOMException("The task was aborted.", "AbortError"));
                    };
                    const submit = () => {
                        if (settled)
                            return;
                        try {
                            task = schedule(() => {
                                if (settled)
                                    return;
                                settled = true;
                                cleanup();
                                try {
                                    resolve(fn());
                                }
                                catch (e) {
                                    reject(e);
                                }
                            }, {
                                priority,
                                scope: defaults.scope,
                                signal,
                            });
                        }
                        catch (e) {
                            settled = true;
                            cleanup();
                            reject(e);
                        }
                    };
                    if (signal)
                        signal.addEventListener("abort", abort, { once: true });
                    const delay = options.delay ?? 0;
                    if (!Number.isFinite(delay) || delay < 0) {
                        settled = true;
                        cleanup();
                        reject(new RangeError("delay must be a finite number >= 0"));
                        return;
                    }
                    if (delay > 0)
                        timer = setTimeout(submit, delay);
                    else
                        submit();
                });
            },
            yield: () => yieldToScheduler(),
        };
    }
    scheduler = Object.assign((s) => s, {
        immediate: this.asScheduler({ priority: "immediate" }),
        userBlocking: this.asScheduler({ priority: "user-blocking" }),
        normal: this.asScheduler({ priority: "normal" }),
        background: this.asScheduler({ priority: "background" }),
        idle: this.asScheduler({ priority: "idle" }),
        macrotask: this.asScheduler({ priority: "normal" }),
        microtask: this.asScheduler({ priority: "immediate" }),
        schedule: schedule,
        scheduleChunked,
        yieldToScheduler,
        withRequestScope,
        Priority: { order: PRIORITY_ORDER },
    });
}
export class REAL_CLOCK {
    _scheduler;
    _tasks = new Set();
    _disposed = false;
    constructor(_scheduler = schedule) {
        this._scheduler = _scheduler;
    }
    now() {
        return performance.now();
    }
    schedule(fn, delay, signal) {
        if (this._disposed || signal?.aborted)
            return { cancel() { }, reprioritize() { } };
        let inner = null;
        let cancelled = false;
        let timer;
        const cleanup = () => {
            if (timer !== undefined)
                clearTimeout(timer);
            signal?.removeEventListener("abort", cancel);
            this._tasks.delete(cancel);
        };
        const cancel = () => {
            if (cancelled)
                return;
            cancelled = true;
            cleanup();
            inner?.cancel();
        };
        this._tasks.add(cancel);
        signal?.addEventListener("abort", cancel, { once: true });
        if (delay <= 0) {
            inner = this._scheduler(() => {
                if (cancelled || this._disposed || signal?.aborted)
                    return;
                cleanup();
                fn();
            }, { priority: "normal", signal });
        }
        else {
            timer = setTimeout(() => {
                if (cancelled || this._disposed || signal?.aborted)
                    return cancel();
                inner = this._scheduler(() => {
                    if (cancelled || this._disposed || signal?.aborted)
                        return;
                    cleanup();
                    fn();
                }, { priority: "normal", signal });
            }, delay);
        }
        return {
            cancel,
            reprioritize(p) {
                inner?.reprioritize(p);
            },
        };
    }
    dispose() {
        if (this._disposed)
            return;
        this._disposed = true;
        for (const cancel of this._tasks)
            cancel();
    }
}
export class VIRTUAL_CLOCK {
    _t = 0;
    _q = [];
    _seq = 0;
    now() {
        return this._t;
    }
    schedule(fn, delay, signal) {
        if (delay < 0)
            throw new RangeError("delay must be >= 0");
        const task = {
            t: this._t + delay,
            seq: this._seq++,
            fn,
            signal,
            cancelled: false,
        };
        this._q.push(task);
        this._q.sort((a, b) => a.t - b.t || a.seq - b.seq);
        return {
            cancel() {
                task.cancelled = true;
            },
            reprioritize() { },
        };
    }
    async tick(ms) {
        if (ms < 0)
            throw new RangeError("ms must be >= 0");
        const end = this._t + ms;
        while (this._q.length && this._q[0].t <= end) {
            const task = this._q.shift();
            this._t = task.t;
            if (task.cancelled || task.signal?.aborted)
                continue;
            task.fn();
            await this._drainMicrotasks();
        }
        this._t = end;
        await this._drainMicrotasks();
    }
    async tickTo(t) {
        if (t < this._t)
            throw new RangeError(`tickTo(${t}) < now(${this._t})`);
        await this.tick(t - this._t);
    }
    async runAll() {
        while (this._q.length) {
            const next = this._q[0];
            await this.tick(Math.max(0, next.t - this._t));
        }
        await this._drainMicrotasks();
    }
    _drainMicrotasks() {
        return new Promise((resolve) => queueMicrotask(resolve));
    }
    dispose() {
        this._q = [];
    }
}
export class SCHEDULER extends VIRTUAL_CLOCK {
    _realSchedulerDrained = false;
    async tick(ms) {
        await super.tick(ms);
        await this._drainReal();
    }
    async tickTo(t) {
        await super.tickTo(t);
        await this._drainReal();
    }
    async runAll() {
        await super.runAll();
        await this._drainReal();
    }
    async _drainReal() {
        // drain the real priority scheduler by yielding a few macrotasks
        for (let i = 0; i < 8; i++) {
            await new Promise((r) => setTimeout(r, 0));
            if (!this._hasPending())
                break;
        }
    }
    _hasPending() {
        return this._q.length > 0;
    }
}
