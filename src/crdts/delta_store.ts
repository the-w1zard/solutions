// delta-store-crdt.ts
//
// Production-grade causal delta-state key-value CRDT.
//
// Semantics:
// - Each key is an LWW register: the highest HLC wins.
// - Identical HLCs resolve deterministically by replica ID.
// - Deletes create tombstones, preventing an older concurrent write from
//   resurrecting a key.
// - Every mutation returns a compact delta.
// - Deltas may arrive duplicated, delayed, or in any order.
// - merge() is commutative, associative, and idempotent.
// - prune() removes entries only after every replica has causally observed
//   the relevant update.

import { CausalContext, compareHlc, decodeHlc, encodeHlc, Json, ReplicaId } from "./utils";

export type StoreKey = string;
export interface ValueVersion<T = Json> {
  readonly value: T;
  readonly hlc: string;
  readonly replicaId: ReplicaId;
  readonly deleted: boolean;
}
export interface DeltaStoreState<T = Json> {
  values: Record<StoreKey, ValueVersion<T>>;
  context: CausalContext;
}
export interface DeltaStoreDelta<T = Json> {
  values: Record<StoreKey, ValueVersion<T>>;
  context: CausalContext;
}
export interface DeltaStoreOptions {
  /** Stable, globally unique replica ID. Never reuse after a restore. */
  replicaId: ReplicaId;
  /** Optional deterministic clock source; useful in tests. */
  now?: () => number;
  /**
   * Maximum clock skew accepted before refusing a local write.
   * Defaults to 5 minutes. This prevents a badly skewed clock from
   * monopolizing conflict resolution.
   */
  maxClockSkewMs?: number;
}
const DEFAULT_MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
function assertNonEmptyString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
}
function cloneVersion<T>(version: ValueVersion<T>): ValueVersion<T> {
  return { ...version };
}
function cloneValues<T>(
  source: Record<StoreKey, ValueVersion<T>> = {},
): Record<StoreKey, ValueVersion<T>> {
  const result: Record<StoreKey, ValueVersion<T>> = Object.create(null);

  for (const [key, version] of Object.entries(source)) {
    result[key] = cloneVersion(version);
  }

  return result;
}
function cloneState<T>(state: DeltaStoreState<T>): DeltaStoreState<T> {
  return {
    values: cloneValues(state.values),
    context: {
      watermarks: { ...state.context?.watermarks },
    },
  };
}
export class DeltaStoreCRDT<T = Json> {
  private readonly replicaId: ReplicaId;
  private readonly now: () => number;
  private readonly maxClockSkewMs: number;

  private physical = 0;
  private logical = 0;

  private values: Record<StoreKey, ValueVersion<T>> = Object.create(null);
  private watermarks: Record<ReplicaId, string> = Object.create(null);

  constructor(options: DeltaStoreOptions) {
    assertNonEmptyString(options.replicaId, 'replicaId');

    this.replicaId = options.replicaId;
    this.now = options.now ?? Date.now;
    this.maxClockSkewMs = options.maxClockSkewMs ?? DEFAULT_MAX_CLOCK_SKEW_MS;
  }
  /**
   * Writes a value and returns a delta containing only that write.
   *
   * A later write to the same key supersedes an earlier one once both are
   * observed. A concurrent write resolves by HLC, then replica ID.
   */
  set(key: StoreKey, value: T): DeltaStoreDelta<T> {
    assertNonEmptyString(key, 'key');

    const hlc = this.nextHlc();

    const version: ValueVersion<T> = {
      value,
      hlc,
      replicaId: this.replicaId,
      deleted: false,
    };

    this.values[key] = version;
    this.observe(hlc);

    return this.createDelta({
      [key]: cloneVersion(version),
    });
  }
  /**
   * Deletes a key and returns a tombstone delta.
   *
   * The tombstone prevents an older write from resurrecting the key after
   * synchronization. A newer write can still intentionally restore it.
   */
  delete(key: StoreKey): DeltaStoreDelta<T> {
    assertNonEmptyString(key, 'key');

    const hlc = this.nextHlc();

    const version: ValueVersion<T> = {
      value: null as T,
      hlc,
      replicaId: this.replicaId,
      deleted: true,
    };

    this.values[key] = version;
    this.observe(hlc);

    return this.createDelta({
      [key]: cloneVersion(version),
    });
  }
  /** Returns the current value, or undefined when absent or deleted. */
  get(key: StoreKey): T | undefined {
    const version = this.values[key];

    if (!version || version.deleted) return undefined;

    return version.value;
  }
  /** Returns true only when the key has a live value. */
  has(key: StoreKey): boolean {
    const version = this.values[key];
    return Boolean(version && !version.deleted);
  }
  /** Returns all live keys. */
  keys(): StoreKey[] {
    return Object.keys(this.values).filter(key => !this.values[key].deleted);
  }

  /** Returns all live values. */
  getAll(): T[] {
    return this.keys().map(key => this.values[key].value);
  }

  /** Returns live key/value pairs. */
  entries(): [StoreKey, T][] {
    return this.keys().map(key => [key, this.values[key].value]);
  }

  size(): number {
    return this.keys().length;
  }

  /**
   * Merges a full remote state.
   *
   * Applying the same state multiple times has no additional effect.
   */
  merge(state: DeltaStoreState<T>): void {
    if (!state || typeof state !== 'object') {
      throw new TypeError('DeltaStoreCRDT.merge expects a valid state.');
    }

    this.mergeWatermarks(state.context?.watermarks ?? {});

    for (const [key, remote] of Object.entries(state.values ?? {})) {
      const local = this.values[key];

      if (!local || this.shouldReplace(local, remote)) {
        this.values[key] = cloneVersion(remote);
      }
    }
  }

  /** Merges one or more deltas. Safe for duplicate and out-of-order delivery. */
  mergeDelta(delta: DeltaStoreDelta<T> | Array<DeltaStoreDelta<T>>): void {
    const deltas = Array.isArray(delta) ? delta : [delta];

    for (const item of deltas) {
      this.merge(item);
    }
  }

  /**
   * Returns changes not represented by `since`.
   *
   * Use the returned delta for normal synchronization; it is substantially
   * smaller than the complete store after the initial sync.
   */
  getDelta(since?: DeltaStoreState<T>): DeltaStoreDelta<T> {
    const sinceValues = since?.values ?? {};
    const changed: Record<StoreKey, ValueVersion<T>> = Object.create(null);

    for (const [key, version] of Object.entries(this.values)) {
      const previous = sinceValues[key];

      if (!previous || previous.hlc !== version.hlc) {
        changed[key] = cloneVersion(version);
      }
    }

    return this.createDelta(changed);
  }

  /**
   * Returns the complete state for initial synchronization or persistence.
   */
  getState(): DeltaStoreState<T> {
    return cloneState({
      values: this.values,
      context: { watermarks: this.watermarks },
    });
  }

  /**
   * Removes history that every known replica has causally observed.
   *
   * A version is removable when its HLC is at or below every replica's
   * watermark. This prevents removing an update that a slow replica may still
   * need in order to resolve a future concurrent write correctly.
   */
  prune(): number {
    const watermarks = Object.values(this.watermarks);
    let removed = 0;

    for (const [key, version] of Object.entries(this.values)) {
      const isStable = watermarks.every(watermark =>
        compareHlc(version.hlc, watermark) <= 0,
      );

      if (isStable) {
        delete this.values[key];
        removed++;
      }
    }

    return removed;
  }

  /**
   * Removes only deleted tombstones that all known replicas have observed.
   *
   * This is the preferred production GC mode: it preserves live values while
   * reclaiming memory used by deletion history.
   */
  pruneTombstones(): number {
    const watermarks = Object.values(this.watermarks);
    let removed = 0;

    for (const [key, version] of Object.entries(this.values)) {
      if (!version.deleted) continue;

      const isStable = watermarks.every(watermark =>
        compareHlc(version.hlc, watermark) <= 0,
      );

      if (isStable) {
        delete this.values[key];
        removed++;
      }
    }

    return removed;
  }

  private shouldReplace(
    local: ValueVersion<T>,
    remote: ValueVersion<T>,
  ): boolean {
    const comparison = compareHlc(remote.hlc, local.hlc);

    if (comparison !== 0) return comparison > 0;

    // Deterministic tie-break for identical HLCs.
    return remote.replicaId > local.replicaId;
  }

  private nextHlc(): string {
    const physicalNow = this.now();

    if (physicalNow > this.physical) {
      this.physical = physicalNow;
      this.logical = 0;
    } else {
      this.logical++;
    }

    // Reject extreme local-clock regressions/skew before it can dominate
    // conflict resolution.
    const maximumAccepted = physicalNow + this.maxClockSkewMs;

    if (this.physical > maximumAccepted) {
      throw new RangeError(
        'Local clock is too far ahead; refusing to create an HLC.',
      );
    }

    return encodeHlc({
      physical: this.physical,
      logical: this.logical,
      replicaId: this.replicaId,
    });
  }

  private observe(hlc: string): void {
    const decoded = decodeHlc(hlc);
    const current = this.watermarks[decoded.replicaId];

    if (!current || compareHlc(hlc, current) > 0) {
      this.watermarks[decoded.replicaId] = hlc;
    }

    if (decoded.physical > this.physical) {
      this.physical = decoded.physical;
      this.logical = 0;
    } else if (
      decoded.physical === this.physical
      && decoded.logical > this.logical
    ) {
      this.logical = decoded.logical;
    }
  }

  private mergeWatermarks(remote: Record<ReplicaId, string>): void {
    for (const [replicaId, hlc] of Object.entries(remote)) {
      const current = this.watermarks[replicaId];

      if (!current || compareHlc(hlc, current) > 0) {
        this.watermarks[replicaId] = hlc;
      }
    }
  }

  private createDelta(
    values: Record<StoreKey, ValueVersion<T>>,
  ): DeltaStoreDelta<T> {
    return {
      values,
      context: {
        watermarks: {
          [this.replicaId]: this.watermarks[this.replicaId],
        },
      },
    };
  }
}
