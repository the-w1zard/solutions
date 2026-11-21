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
    isFailure?: (err: unknown) => boolean;
    timeoutMs?: number;
}
export declare class CIRCUITBREAKER {
    private readonly name;
    private readonly opts;
    private readonly onChange;
    private readonly staff;
    state: CBCircuitState;
    private consecutiveFailures;
    private halfOpenAttempts;
    private openedAt;
    private currentCooldown;
    private trips;
    constructor(name: string, opts: Required<CBCircuitBreakerOptions>, onChange: (from: CBCircuitState, to: CBCircuitState) => void, staff: any);
    /** Runs fn under breaker protection. Falls back if provided and circuit is blocking. */
    execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T>;
    forceOpen(): void;
    forceClose(): void;
    /** Call before attempting a request. Returns false if the circuit is blocking traffic. */
    canAttempt(): boolean;
    recordSuccess(): void;
    recordFailure(): void;
    get cooldownRemainingMs(): number;
    private trip;
    private transition;
    private withTimeout;
}
