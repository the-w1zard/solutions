export class CIRCUITBREAKER {
    name;
    opts;
    onChange;
    staff;
    state = 'closed';
    consecutiveFailures = 0;
    halfOpenAttempts = 0;
    openedAt = 0;
    currentCooldown;
    trips = 0;
    constructor(name, opts, onChange, staff) {
        this.name = name;
        this.opts = opts;
        this.onChange = onChange;
        this.staff = staff;
        this.currentCooldown = opts.cooldownMs;
        // adopt remote trips immediately instead of discovering the failure independently
        this.staff.stateDRS(`circuit:${this.name}`, 'state', (p) => {
            if (!p || p.state === this.state)
                return;
            if (p.state === 'open') {
                this.openedAt = p.openedAt;
                this.currentCooldown = p.cooldownMs;
                this.trips = p.trips ?? this.trips;
            }
            this.transition(p.state, /*broadcast*/ false);
        });
    }
    /** Runs fn under breaker protection. Falls back if provided and circuit is blocking. */
    async execute(fn, fallback) {
        if (!this.canAttempt()) {
            if (fallback)
                return fallback();
            throw new Error(`Circuit "${this.name}" is open`);
        }
        try {
            const result = this.opts.timeoutMs
                ? await this.withTimeout(fn(), this.opts.timeoutMs)
                : await fn();
            this.recordSuccess();
            return result;
        }
        catch (err) {
            if (this.opts.isFailure(err)) {
                this.recordFailure();
            }
            if (fallback)
                return fallback();
            throw err;
        }
    }
    forceOpen() {
        this.openedAt = Date.now();
        this.currentCooldown = this.opts.cooldownMaxMs;
        this.transition('open');
    }
    forceClose() {
        this.consecutiveFailures = 0;
        this.trips = 0;
        this.currentCooldown = this.opts.cooldownMs;
        this.transition('closed');
    }
    /** Call before attempting a request. Returns false if the circuit is blocking traffic. */
    canAttempt() {
        if (this.state === 'closed')
            return true;
        if (this.state === 'open') {
            if (Date.now() - this.openedAt < this.currentCooldown)
                return false;
            this.transition('half-open');
            this.halfOpenAttempts = 0;
            return true;
        }
        return this.halfOpenAttempts < this.opts.halfOpenMaxAttempts;
    }
    recordSuccess() {
        this.consecutiveFailures = 0;
        if (this.state === 'half-open') {
            this.trips = 0;
            this.currentCooldown = this.opts.cooldownMs;
            this.transition('closed');
        }
    }
    recordFailure() {
        if (this.state === 'half-open') {
            this.halfOpenAttempts += 1;
            if (this.halfOpenAttempts >= this.opts.halfOpenMaxAttempts)
                this.trip();
            return;
        }
        this.consecutiveFailures += 1;
        if (this.state === 'closed' && this.consecutiveFailures >= this.opts.failureThreshold) {
            this.trip();
        }
    }
    get cooldownRemainingMs() {
        if (this.state !== 'open')
            return 0;
        return Math.max(0, this.currentCooldown - (Date.now() - this.openedAt));
    }
    trip() {
        this.trips += 1;
        this.consecutiveFailures = 0;
        this.halfOpenAttempts = 0;
        this.openedAt = Date.now();
        this.currentCooldown = Math.min(this.opts.cooldownMaxMs, this.opts.cooldownMs * Math.pow(this.opts.cooldownFactor, this.trips - 1));
        this.transition('open');
    }
    transition(next, broadcast = true) {
        if (next === this.state)
            return;
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
    withTimeout(promise, ms) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Circuit "${this.name}" call timed out`)), ms);
            promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
        });
    }
}
// #endregion
