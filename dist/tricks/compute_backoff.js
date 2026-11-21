export function computeBackoff(attempt, opts) {
    const raw = Math.min(opts.max, opts.base * Math.pow(opts.factor, attempt));
    if (!opts.jitter)
        return raw;
    // full jitter, per AWS backoff guidance
    return Math.random() * raw;
}
// #endregion
