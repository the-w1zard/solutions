import { PRIORITY_ORDER, schedule, scheduleChunked, withRequestScope, yieldToScheduler } from "../performance/scheduler";

export class CLOCK {
	private _activeClock: Clock;
	private _virtualClock: Clock;
	constructor() {
		this._activeClock = new REAL_CLOCK();
		this._virtualClock = new VIRTUAL_CLOCK();
	}
	defaultClock: Clock = {
		now: () => this._activeClock.now(),
		schedule: (fn: A, delay: A, signal: A) => this._activeClock.schedule(fn, delay, signal),
		dispose: () => this._activeClock.dispose(),
	};
	getDefaultClock(): Clock {
		return this._activeClock;
	}
	refreshDefaultClock() {
		this._activeClock.dispose();
		this._activeClock = new REAL_CLOCK();
	}
	getVirtualClock(): Clock {
		return this._virtualClock;
	}
	refreshVirtualClock() {
		this._virtualClock.dispose();
		this._virtualClock = new VIRTUAL_CLOCK();
	}
	noop = {
		cancel() {},
		reprioritize() {},
	};
	_scheduler = {
		sync: {
			now: () => performance.now(),
			schedule: (fn: () => V): Task => {
				fn();
				return this.noop;
			},
		} satisfies ClockScheduler,

		microtask: {
			now: () => Date.now(),
			schedule: (fn: () => V): Task => {
				let cancelled = false;
				queueMicrotask(() => {
					if (!cancelled) fn();
				});
				return {
					cancel: () => {
						cancelled = true;
					},
					reprioritize() {},
				};
			},
		} satisfies ClockScheduler,

		macrotask: {
			now: () => Date.now(),
			schedule: (fn: () => V, delay = 0): Task => {
				const id = setTimeout(fn, delay);
				return {
					cancel: () => clearTimeout(id),
					reprioritize() {},
				};
			},
		} satisfies ClockScheduler,
		animationFrame: {
			now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
			schedule: (fn, delay) => {
				if (typeof requestAnimationFrame === "undefined") {
					const id = setTimeout(fn, delay);
					return { cancel: () => clearTimeout(id) };
				}
				let cancelled = false;
				const id = requestAnimationFrame(() => {
					if (!cancelled) fn();
				});
				return {
					cancel: () => {
						cancelled = true;
						cancelAnimationFrame(id);
					},
				};
			},
		} as Scheduler,

		bun: {
			now: () => {
				const g = globalThis as A;
				if (g.Bun?.nanoseconds) return Number(g.Bun.nanoseconds()) / 1e6;
				return Date.now();
			},
			schedule: (fn, delay) => {
				const g = globalThis as A;
				if (g.Bun?.sleep) {
					let cancelled = false;
					g.Bun.sleep(delay).then(() => {
						if (!cancelled) fn();
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
		} as Scheduler,

		custom(s: Scheduler): Scheduler {
			return s;
		},
	};
	asScheduler(defaults: { priority?: Priority; scope?: S } = {}): Scheduler {
		return {
			now: () => performance.now(),
	
			schedule: (fn: () => V, delay = 0) => {
				let cancelled = false;
				let timer: RET<typeof setTimeout> | UD;
				let inner: RET<typeof schedule> | UD;
	
				const cancel = () => {
					if (cancelled) return;
					cancelled = true;
					if (timer !== undefined) clearTimeout(timer);
					inner?.cancel();
				};
	
				const submit = () => {
					if (cancelled) return;
					try {
						inner = schedule(
							() => {
								if (cancelled) return;
								cancelled = true;
								fn();
							},
							{
								priority: defaults.priority ?? "normal",
								scope: defaults.scope,
							},
						);
					} catch (e) {
						cancel();
						throw e;
					}
				};
	
				if (!Number.isFinite(delay) || delay < 0) {
					throw new RangeError("delay must be a finite number >= 0");
				}
	
				if (delay > 0) timer = setTimeout(submit, delay);
				else submit();
	
				return {
					cancel,
					reprioritize(p: Priority) {
						inner?.reprioritize(p);
					},
				};
			},
	
			postTask: <T>(fn: () => T, options: SchedulerPostTaskOptions = {}): Promise<Awaited<T>> => {
				return new Promise((resolve, reject) => {
					const signal = options.signal;
					if (signal?.aborted) {
						reject(signal.reason ?? new DOMException("The task was aborted.", "AbortError"));
						return;
					}
	
					const priority: Priority =
						options.priority === "user-blocking" ? "user-blocking" :
						options.priority === "background" ? "background" :
						defaults.priority ?? "normal";
	
					let timer: RET<typeof setTimeout> | UD;
					let task: Task | UD;
					let settled = false;
	
					const cleanup = () => {
						if (timer !== undefined) clearTimeout(timer);
						signal?.removeEventListener("abort", abort);
					};
	
					const abort = () => {
						if (settled) return;
						settled = true;
						cleanup();
						task?.cancel();
						reject(signal?.reason ?? new DOMException("The task was aborted.", "AbortError"));
					};
	
					const submit = () => {
						if (settled) return;
	
						try {
							task = schedule(
								() => {
									if (settled) return;
									settled = true;
									cleanup();
	
									try {
										resolve(fn() as Awaited<T>);
									} catch (e) {
										reject(e);
									}
								},
								{
									priority,
									scope: defaults.scope,
									signal,
								},
							);
						} catch (e) {
							settled = true;
							cleanup();
							reject(e);
						}
					};
	
					if (signal) signal.addEventListener("abort", abort, { once: true });
	
					const delay = options.delay ?? 0;
					if (!Number.isFinite(delay) || delay < 0) {
						settled = true;
						cleanup();
						reject(new RangeError("delay must be a finite number >= 0"));
						return;
					}
	
					if (delay > 0) timer = setTimeout(submit, delay);
					else submit();
				});
			},
	
			yield: () => yieldToScheduler(),
		};
	}
	scheduler: SCHEDULER_FN = Object.assign((s: Scheduler): Scheduler => s, {
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

export class REAL_CLOCK implements Clock {
	private _tasks = new Set<() => V>();
	private _disposed = false;
	constructor(private _scheduler: typeof schedule = schedule) {}
	now(): N {
		return performance.now();
	}
	schedule(fn: () => V, delay: N, signal?: AbortSignal): Task {
		if (this._disposed || signal?.aborted) return { cancel() {}, reprioritize() {} };
		let inner: Task | null = null;
		let cancelled = false;
		let timer: RET<typeof setTimeout> | UD;
		const cleanup = () => {
			if (timer !== undefined) clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
			this._tasks.delete(cancel);
		};
		const cancel = () => {
			if (cancelled) return;
			cancelled = true;
			cleanup();
			inner?.cancel();
		};
		this._tasks.add(cancel);
		signal?.addEventListener("abort", cancel, { once: true });
		if (delay <= 0) {
			inner = this._scheduler(
				() => {
					if (cancelled || this._disposed || signal?.aborted) return;
					cleanup();
					fn();
				},
				{ priority: "normal", signal },
			);
		} else {
			timer = setTimeout(() => {
				if (cancelled || this._disposed || signal?.aborted) return cancel();
				inner = this._scheduler(
					() => {
						if (cancelled || this._disposed || signal?.aborted) return;
						cleanup();
						fn();
					},
					{ priority: "normal", signal },
				);
			}, delay);
		}
		return {
			cancel,
			reprioritize(p) {
				inner?.reprioritize(p);
			},
		};
	}
	dispose(): V {
		if (this._disposed) return;
		this._disposed = true;
		for (const cancel of this._tasks) cancel();
	}
}
export class VIRTUAL_CLOCK implements Clock {
	private _t = 0;
	private _q: VirtualTask[] = [];
	private _seq = 0;
	now(): number {
		return this._t;
	}
	schedule(fn: () => V, delay: N, signal?: AbortSignal): Task {
		if (delay < 0) throw new RangeError("delay must be >= 0");
		const task: VirtualTask = {
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
			reprioritize() {},
		};
	}
	async tick(ms: N): P<V> {
		if (ms < 0) throw new RangeError("ms must be >= 0");
		const end = this._t + ms;
		while (this._q.length && this._q[0].t <= end) {
			const task = this._q.shift()!;
			this._t = task.t;
			if (task.cancelled || task.signal?.aborted) continue;
			task.fn();
			await this._drainMicrotasks();
		}
		this._t = end;
		await this._drainMicrotasks();
	}
	async tickTo(t: N): Promise<void> {
		if (t < this._t) throw new RangeError(`tickTo(${t}) < now(${this._t})`);
		await this.tick(t - this._t);
	}
	async runAll(): P<V> {
		while (this._q.length) {
			const next = this._q[0];
			await this.tick(Math.max(0, next.t - this._t));
		}
		await this._drainMicrotasks();
	}
	private _drainMicrotasks(): P<V> {
		return new Promise((resolve) => queueMicrotask(resolve));
	}
	dispose(): V {
		this._q = [];
	}
}
export class SCHEDULER extends VIRTUAL_CLOCK {
	private _realSchedulerDrained = false;

	async tick(ms: N): P<V> {
		await super.tick(ms);
		await this._drainReal();
	}

	async tickTo(t: N): P<V> {
		await super.tickTo(t);
		await this._drainReal();
	}

	async runAll(): P<V> {
		await super.runAll();
		await this._drainReal();
	}

	private async _drainReal(): P<V> {
		// drain the real priority scheduler by yielding a few macrotasks
		for (let i = 0; i < 8; i++) {
			await new Promise<void>((r) => setTimeout(r, 0));
			if (!this._hasPending()) break;
		}
	}

	private _hasPending(): B {
		return (this as any)._q.length > 0;
	}
}
interface VirtualTask {
	t: N;
	fn: () => V;
	signal?: AbortSignal;
	cancelled: B;
	seq: N;
}
type ClockScheduler = {
	now(): N;
	schedule(fn: () => V, delay?: N): Task;
};
type SCHEDULER_FN = {
	(s: Scheduler): Scheduler;
	immediate: Scheduler;
	userBlocking: Scheduler;
	normal: Scheduler;
	background: Scheduler;
	idle: Scheduler;
	macrotask: Scheduler;
	microtask: Scheduler;
	schedule: typeof schedule;
	scheduleChunked: typeof scheduleChunked;
	yieldToScheduler: typeof yieldToScheduler;
	withRequestScope: typeof withRequestScope;
	Priority: { order: typeof PRIORITY_ORDER };
};

interface Clock {
	now(): N;
	schedule(fn: () => V, delay: N, signal?: AbortSignal): Task;
	dispose(): V;
}
