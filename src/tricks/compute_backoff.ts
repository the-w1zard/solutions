//                                    COMPUTE BACKOFF
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export interface BackoffOptions {
  base?: number;
  factor?: number;
  max?: number;
  jitter?: boolean;
}
export function computeBackoff(attempt: number, opts: Required<BackoffOptions>): number {
  const raw = Math.min(opts.max, opts.base * Math.pow(opts.factor, attempt));
  if (!opts.jitter) return raw;
  // full jitter, per AWS backoff guidance
  return Math.random() * raw;
}
// #endregion
