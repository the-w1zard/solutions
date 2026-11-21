const queuedLength = 0;
export class Queue {
    options;
    tasks = [];
    running = [];
    isPaused = false;
    idleListeners = new Set();
    constructor(optionsOrConcurrent = 1) {
        const opts = typeof optionsOrConcurrent === 'number' ? { concurrent: optionsOrConcurrent } : optionsOrConcurrent;
        this.options = {
            concurrent: opts.concurrent ?? 1,
            retry: opts.retry ?? 0,
            timeout: opts.timeout ?? 0,
            priority: opts.priority ?? false,
            onError: opts.onError ?? (() => { }),
            onComplete: opts.onComplete ?? (() => { }),
            onChange: opts.onChange ?? (() => { })
        };
    }
    async run(taskOrTasks, taskOptions) {
        if (Array.isArray(taskOrTasks)) {
            return Promise.all(taskOrTasks.map(fn => this.add(fn, taskOptions)));
        }
        return this.add(taskOrTasks, taskOptions);
    }
    add(fn, taskOptions) {
        return new Promise((resolve, reject) => {
            let insertIndex = queuedLength;
            let firstInsertedIndex = insertIndex;
            const task = { fn, priority: taskOptions?.priority ?? 0, label: taskOptions?.label, resolve, reject };
            if (this.options.priority) {
                const insertIndex = this.tasks.findIndex(t => (t.priority ?? 0) < (task.priority ?? 0));
                if (insertIndex === -1) {
                    this.tasks.push(task);
                }
                else {
                    this.tasks.splice(insertIndex, 0, task);
                }
            }
            else {
                this.tasks.push(task);
            }
            this.options.onChange();
            this.process();
        });
    }
    async process2() {
        if (this.isPaused)
            return;
        if (this.running.length >= this.options.concurrent)
            return;
        if (this.tasks.length === 0)
            return;
        const task = this.tasks.shift();
        this.running.push(task);
        this.options.onChange();
        try {
            const result = await this.executeWithRetry(task.fn);
            task.resolve(result);
            this.options.onComplete(result);
        }
        catch (error) {
            task.reject(error);
            this.options.onError(error, task);
        }
        finally {
            this.running = this.running.filter(t => t !== task);
            this.options.onChange();
            this.maybeFireIdle();
            this.process();
        }
    }
    process() {
        if (this.isPaused)
            return;
        while (!this.isPaused &&
            this.running.length < this.options.concurrent &&
            this.tasks.length > 0) {
            const task = this.tasks.shift();
            this.running.push(task);
            this.options.onChange();
            void this.runTask(task);
        }
    }
    async runTask(task) {
        try {
            const result = await this.executeWithRetry(task.fn);
            task.resolve(result);
            this.options.onComplete(result);
        }
        catch (error) {
            task.reject(error);
            this.options.onError(error, task);
        }
        finally {
            this.running = this.running.filter((running) => running !== task);
            this.options.onChange();
            this.maybeFireIdle();
            // Backfill the slot immediately.
            this.process();
        }
    }
    async executeWithRetry(fn, attempt = 0) {
        try {
            if (this.options.timeout > 0) {
                return await this.withTimeout(fn(), this.options.timeout);
            }
            return await fn();
        }
        catch (error) {
            if (attempt < this.options.retry) {
                return this.executeWithRetry(fn, attempt + 1);
            }
            throw error;
        }
    }
    withTimeout(promise, ms) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                if (settled)
                    return;
                settled = true;
                reject(new Error('Timeout'));
            }, ms);
            promise.then((v) => { if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(v);
            } }, (e) => { if (!settled) {
                settled = true;
                clearTimeout(timer);
                reject(e);
            } });
        });
    }
    /** Resolves immediately if already idle, otherwise resolves the next time the queue fully empties. No polling. */
    onIdle() {
        if (this.tasks.length === 0 && this.running.length === 0 && !this.isPaused)
            return Promise.resolve();
        return new Promise((resolve) => { this.idleListeners.add(resolve); });
    }
    removeAt(index) {
        if (index < 0 || index >= this.tasks.length)
            return;
        const [task] = this.tasks.splice(index, 1);
        task.reject(new Error('Removed from queue'));
        this.options.onChange();
    }
    moveUp(index) {
        if (index <= 0 || index >= this.tasks.length)
            return;
        [this.tasks[index - 1], this.tasks[index]] = [this.tasks[index], this.tasks[index - 1]];
        this.options.onChange();
    }
    moveDown(index) {
        if (index < 0 || index >= this.tasks.length - 1)
            return;
        [this.tasks[index], this.tasks[index + 1]] = [this.tasks[index + 1], this.tasks[index]];
        this.options.onChange();
    }
    moveToNext(index) {
        if (index <= 0 || index >= this.tasks.length)
            return;
        const [task] = this.tasks.splice(index, 1);
        this.tasks.unshift(task);
        this.options.onChange();
    }
    moveToLast(index) {
        if (index < 0 || index >= this.tasks.length - 1)
            return;
        const [task] = this.tasks.splice(index, 1);
        this.tasks.push(task);
        this.options.onChange();
    }
    start() { this.isPaused = false; this.maybeFireIdle(); this.process(); }
    stop() { this.isPaused = true; }
    maybeFireIdle() {
        if (this.tasks.length === 0 && this.running.length === 0 && !this.isPaused) {
            this.idleListeners.forEach(resolve => resolve());
            this.idleListeners.clear();
        }
    }
    clear() {
        this.tasks = [];
        this.options.onChange();
        this.maybeFireIdle();
    }
    flush() {
        const pending = [...this.tasks];
        this.tasks = [];
        pending.forEach(task => task.reject(new Error('Queue flushed')));
        this.options.onChange();
        this.maybeFireIdle();
    }
    peek() { return this.tasks[0]; }
    peekAll() { return [...this.tasks]; }
    getRunning() { return [...this.running]; }
    get size() { return this.tasks.length; }
    get isEmpty() { return this.tasks.length === 0; }
    get isRunning() { return this.running.length > 0; }
    get isPausedState() { return this.isPaused; }
    get pending() { return this.tasks.length; }
    get active() { return this.running.length; }
    setOptions(newOptions) { this.options = { ...this.options, ...newOptions }; }
}
export function queue(options) {
    const q = new Queue(options);
    const runFn = (taskOrTasks, taskOptions) => {
        return q.run(taskOrTasks, taskOptions);
    };
    runFn.start = () => q.start();
    runFn.stop = () => q.stop();
    runFn.clear = () => q.clear();
    runFn.flush = () => q.flush();
    runFn.onIdle = () => q.onIdle();
    runFn.peek = () => q.peek();
    runFn.peekAll = () => q.peekAll();
    runFn.getRunning = () => q.getRunning();
    runFn.removeAt = (i) => q.removeAt(i);
    runFn.moveUp = (i) => q.moveUp(i);
    runFn.moveDown = (i) => q.moveDown(i);
    runFn.moveToNext = (i) => q.moveToNext(i);
    runFn.moveToLast = (i) => q.moveToLast(i);
    runFn.setOptions = (opts) => q.setOptions(opts);
    Object.defineProperty(runFn, 'size', { get: () => q.size });
    Object.defineProperty(runFn, 'isEmpty', { get: () => q.isEmpty });
    Object.defineProperty(runFn, 'isRunning', { get: () => q.isRunning });
    Object.defineProperty(runFn, 'isPausedState', { get: () => q.isPausedState });
    Object.defineProperty(runFn, 'pending', { get: () => q.pending });
    Object.defineProperty(runFn, 'active', { get: () => q.active });
    return runFn;
}
export class TIERED_QUEUE {
    config;
    tiers = new Map();
    tierOrder = [];
    stagedTasks = new Map(); // Tasks waiting to be released for their priority batch. `ADD()` writes here. `execute()` drains it.
    tierResults = new Map(); // Final successful values, grouped by tier.
    constructor(config = {}) {
        this.config = config;
    }
    // registerTier
    REG(tier, options) {
        if (!this.tiers.has(tier)) {
            const tierQueue = queue({
                concurrent: options?.concurrent ?? this.config.defaultConcurrent ?? 100,
                retry: options?.retry ?? this.config.retry ?? 0,
                timeout: options?.timeout ?? this.config.timeout ?? 30_000,
                priority: false,
                onError: (error, task) => { console.log(`✘[QUEUE-TIERED][FAILED][${tier}] [${task.label}]`); this.config.onTierError?.(tier, error); },
                onComplete: () => { console.log(`✔[QUEUE-TIERED][COMPLETED][${tier}] `); },
            }); // Important: A tier queue is dormant until `execute()` releases its batch.
            tierQueue.stop();
            this.tiers.set(tier, tierQueue);
            this.stagedTasks.set(tier, []);
            this.tierResults.set(tier, []);
            this.tierOrder.push(tier);
            this.tierOrder.sort((a, b) => a - b);
        }
        return this;
    } // Registers a task in its priority batch. It intentionally does NOT run now. The returned promise resolves/rejects when `execute()` eventually reaches this task's batch.
    // addToTier
    ADD(tier, label, task, options) {
        this.REG(tier, options);
        return new Promise((resolve, reject) => {
            this.stagedTasks.get(tier).push({ label, task, resolve, reject, });
        });
    } // Adds many tasks to one priority batch. All tasks in this call—and all previous tasks added at this same priority—run in the same concurrent batch when execute() reaches it.
    // addBatchToTier 
    ADD_BATCH(tier, tasks, options) {
        return Promise.all(tasks.map(({ label, task }) => this.ADD(tier, label, task, options)));
    } // Runs priority batches in ascending numeric order:
    // priority 0 → all concurrent tasks settle
    // priority 1 → all concurrent tasks settle
    // priority 2 → all concurrent tasks settle
    async execute() {
        const allResults = new Map();
        for (const tier of this.tierOrder) {
            const tierQueue = this.tiers.get(tier);
            const staged = this.stagedTasks.get(tier) ?? [];
            const tierResults = this.tierResults.get(tier);
            if (staged.length === 0) {
                allResults.set(tier, [...tierResults]);
                continue;
            }
            console.log(`▶[QUEUE-TIERED][START][${tier}] ${staged.length} task(s)`);
            const pending = staged.splice(0, staged.length); // Queue all members of the batch BEFORE start(). This guarantees every task in the batch is available together. `Queue.process()` then chooses how many can actually run at once, according to its `concurrent` setting.
            const scheduled = pending.map((entry) => {
                return tierQueue(async () => {
                    const startedAt = Date.now();
                    try {
                        const value = await entry.task();
                        const duration = Date.now() - startedAt;
                        tierResults.push(value);
                        entry.resolve(value);
                        console.log(`✔[QUEUE][DONE][T${tier}] [${entry.label}] ⏱️${duration}ms`);
                        return value;
                    }
                    catch (error) {
                        const duration = Date.now() - startedAt;
                        console.log(`✘[QUEUE][FAIL][T${tier}]:[${entry.label}] ⏱️${duration}ms Error: ${error} `);
                        entry.resolve(undefined); // Preserve your old return convention: failed ADD calls resolve undefined rather than reject. If you prefer normal Promise semantics, replace this line with `entry.reject(error)`.
                        throw error;
                    }
                }, { label: entry.label });
            });
            tierQueue.start(); // Release this exact priority batch only after all members have been queued.
            await Promise.allSettled(scheduled); //  Do not use Promise.all here: one rejected task would cause the next priority batch to start early.
            await tierQueue.onIdle(); //  This is mostly redundant after `allSettled`, but retains the queue's own authoritative idle lifecycle.
            this.config.onTierComplete?.(tier, [...tierResults]);
            allResults.set(tier, [...tierResults]);
            console.log(`✔[QUEUE-TIERED][BATCH-DONE][${tier}]: ${tierResults.length} successful result(s)`);
        }
        return allResults;
    }
    getStatus() {
        return this.tierOrder.map((tier) => {
            const tierQueue = this.tiers.get(tier);
            return {
                tier,
                staged: this.stagedTasks.get(tier)?.length ?? 0,
                pending: tierQueue.pending,
                active: tierQueue.active,
                completed: this.tierResults.get(tier)?.length ?? 0,
            };
        });
    } // Cancels tasks that have not reached an active queue yet. Existing active tasks cannot generally be force-cancelled unless their `task()` implementation supports AbortSignal.
    clear() {
        for (const [tier, staged] of this.stagedTasks) {
            for (const entry of staged) {
                entry.reject(new Error(`Tier ${tier} cleared before execution`));
            }
            staged.length = 0;
        }
        for (const tierQueue of this.tiers.values()) {
            tierQueue.clear();
        }
        for (const results of this.tierResults.values()) {
            results.length = 0;
        }
    }
}
