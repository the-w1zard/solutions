//                                    CIRCUIT BREAKER
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
/**
const dbBreaker = new CircuitBreaker(
  "postgres-primary", // name — this is also the bus rt key, keep it unique per protected resource
  {
    failureThreshold: 5,
    cooldownMs: 1000,
    cooldownMaxMs: 30000,
    cooldownFactor: 2,
    halfOpenMaxAttempts: 3,
    timeoutMs: 4000,
    isFailure: (err) => !(err instanceof ClientValidationError), // bad input isn't the DB's fault — don't trip on it
  },
  (from, to) => console.log(`[postgres-primary] ${from} → ${to}`),
  staff, // bus handle
);

async function getUser(id: string) {
  return dbBreaker.execute(
    () => db.query("SELECT * FROM users WHERE id = $1", [id]), // protected call
    () => cache.getStale(`user:${id}`),                         // fallback if circuit is open
  );
}
 */
export type CBCircuitState = 'closed' | 'open' | 'half-open';

export interface CBCircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
  cooldownMaxMs: number;
  cooldownFactor: number;
  halfOpenMaxAttempts: number;
  isFailure?: (err: unknown) => boolean; // default: everything counts as a failure
  timeoutMs?: number;                     // slow calls count as failures
}
export class CIRCUITBREAKER {
  state: CBCircuitState = 'closed';

  private consecutiveFailures = 0;
  private halfOpenAttempts = 0;
  private openedAt = 0;
  private currentCooldown: number;
  private trips = 0;

  constructor(
    private readonly name: string,
    private readonly opts: Required<CBCircuitBreakerOptions>,
    private readonly onChange: (from: CBCircuitState, to: CBCircuitState) => void,
    private readonly staff: any, // bus handle — sendsub/stateDRS
  ) {
    this.currentCooldown = opts.cooldownMs;

    // adopt remote trips immediately instead of discovering the failure independently
    this.staff.stateDRS(`circuit:${this.name}`, 'state', (p: any) => {
      if (!p || p.state === this.state) return;
      if (p.state === 'open') {
        this.openedAt = p.openedAt;
        this.currentCooldown = p.cooldownMs;
        this.trips = p.trips ?? this.trips;
      }
      this.transition(p.state, /*broadcast*/ false);
    });
  }
  /** Runs fn under breaker protection. Falls back if provided and circuit is blocking. */
  public async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    if (!this.canAttempt()) {
      if (fallback) return fallback();
      throw new Error(`Circuit "${this.name}" is open`);
    }

    try {
      const result = this.opts.timeoutMs
        ? await this.withTimeout(fn(), this.opts.timeoutMs)
        : await fn();
      this.recordSuccess();
      return result;
    } catch (err) {
      if (this.opts.isFailure(err)) {
        this.recordFailure();
      }
      if (fallback) return fallback();
      throw err;
    }
  }
  public forceOpen(): void {
    this.openedAt = Date.now();
    this.currentCooldown = this.opts.cooldownMaxMs;
    this.transition('open');
  }
  public forceClose(): void {
    this.consecutiveFailures = 0;
    this.trips = 0;
    this.currentCooldown = this.opts.cooldownMs;
    this.transition('closed');
  }
  /** Call before attempting a request. Returns false if the circuit is blocking traffic. */
  public canAttempt(): boolean {
    if (this.state === 'closed') return true;

    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.currentCooldown) return false;
      this.transition('half-open');
      this.halfOpenAttempts = 0;
      return true;
    }

    return this.halfOpenAttempts < this.opts.halfOpenMaxAttempts;
  }
  public recordSuccess(): void {
    this.consecutiveFailures = 0;
    if (this.state === 'half-open') {
      this.trips = 0;
      this.currentCooldown = this.opts.cooldownMs;
      this.transition('closed');
    }
  }
  public recordFailure(): void {
    if (this.state === 'half-open') {
      this.halfOpenAttempts += 1;
      if (this.halfOpenAttempts >= this.opts.halfOpenMaxAttempts) this.trip();
      return;
    }
    this.consecutiveFailures += 1;
    if (this.state === 'closed' && this.consecutiveFailures >= this.opts.failureThreshold) {
      this.trip();
    }
  }
  public get cooldownRemainingMs(): number {
    if (this.state !== 'open') return 0;
    return Math.max(0, this.currentCooldown - (Date.now() - this.openedAt));
  }
  private trip(): void {
    this.trips += 1;
    this.consecutiveFailures = 0;
    this.halfOpenAttempts = 0;
    this.openedAt = Date.now();
    this.currentCooldown = Math.min(
      this.opts.cooldownMaxMs,
      this.opts.cooldownMs * Math.pow(this.opts.cooldownFactor, this.trips - 1),
    );
    this.transition('open');
  }
  private transition(next: CBCircuitState, broadcast = true): void {
    if (next === this.state) return;
    const from = this.state;
    this.state = next;
    this.onChange(from, next);

    if (broadcast) {
      this.staff.sendsub(`circuit:${this.name}`, 'state', {
        state: next,
        openedAt: this.openedAt,
        cooldownMs: this.currentCooldown,
        trips: this.trips,
      });
    }
  }
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Circuit "${this.name}" call timed out`)), ms);
      promise.then(
        (v) => { clearTimeout(timer); resolve(v); },
        (e) => { clearTimeout(timer); reject(e); },
      );
    });
  }
}
// #endregion
