// version-vector-crdt.ts
//
// Production-grade Version Vector CRDT.
//
// Semantics:
// - Each replica owns one monotonically increasing counter.
// - increment(replicaId) advances only that replica's counter.
// - merge() takes the component-wise maximum.
// - compare() detects equal, before/after, or concurrent histories.
// - merge is commutative, associative, and idempotent.
// - Deltas are safe to deliver repeatedly and in any order.

import { ReplicaId } from "./utils";


export type VersionVectorState = Record<ReplicaId, number>;

export type VersionVectorDelta = Partial<VersionVectorState>;

export type CausalRelationVector =
  | 'equal'
  | 'before'
  | 'after'
  | 'concurrent';

export interface VersionVectorOptions {
  /**
   * Stable, globally unique replica ID.
   * Must never be reused after restoring from a backup.
   */
  replicaId: ReplicaId;
}

function assertNonEmptyString(
  value: unknown,
  name: string,
): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string.`);
  }
}

function assertCounter(value: unknown, name: string): asserts value is number {
  if (
    typeof value !== 'number'
    || !Number.isSafeInteger(value)
    || value < 0
  ) {
    throw new TypeError(`${name} must be a non-negative safe integer.`);
  }
}

/** Returns a defensive copy of a version-vector state. */
export function cloneVersionVector(
  state: VersionVectorState = {},
): VersionVectorState {
  const result: VersionVectorState = Object.create(null);

  for (const [replicaId, counter] of Object.entries(state)) {
    assertCounter(counter, `version vector counter for ${replicaId}`);
    result[replicaId] = counter;
  }

  return result;
}

/**
 * Merges two version vectors using the pointwise maximum.
 *
 * This function does not mutate either input.
 */
export function mergeVersionVectors(
  a: VersionVectorState = {},
  b: VersionVectorState = {},
): VersionVectorState {
  const result: VersionVectorState = Object.create(null);

  for (const [replicaId, counter] of Object.entries(a)) {
    assertCounter(counter, `version vector counter for ${replicaId}`);
    result[replicaId] = counter;
  }

  for (const [replicaId, counter] of Object.entries(b)) {
    assertCounter(counter, `version vector counter for ${replicaId}`);

    result[replicaId] = Math.max(result[replicaId] ?? 0, counter);
  }

  return result;
}

/**
 * Compares two version vectors.
 *
 * - `equal`: identical causal histories
 * - `before`: `a` is an ancestor of `b`
 * - `after`: `a` dominates `b`
 * - `concurrent`: neither vector dominates the other
 */
export function compareVersionVectors(
  a: VersionVectorState = {},
  b: VersionVectorState = {},
): CausalRelationVector {
  let aDominatesB = false;
  let bDominatesA = false;

  for (const [replicaId, aCounter] of Object.entries(a)) {
    assertCounter(aCounter, `version vector counter for ${replicaId}`);

    const bCounter = b[replicaId] ?? 0;

    if (aCounter > bCounter) aDominatesB = true;
    if (aCounter < bCounter) bDominatesA = true;
  }

  for (const [replicaId, bCounter] of Object.entries(b)) {
    assertCounter(bCounter, `version vector counter for ${replicaId}`);

    const aCounter = a[replicaId] ?? 0;

    if (bCounter > aCounter) bDominatesA = true;
    if (bCounter < aCounter) aDominatesB = true;
  }

  if (aDominatesB && bDominatesA) return 'concurrent';
  if (aDominatesB) return 'after';
  if (bDominatesA) return 'before';

  return 'equal';
}

/** Returns true when `a` contains every update represented by `b`. */
export function dominates(a: VersionVectorState, b: VersionVectorState): boolean {
  for (const [replicaId, counter] of Object.entries(b)) {
    if ((a[replicaId] ?? 0) < counter) return false;
  }

  return true;
}

/** Returns only entries in `current` that are newer than `since`. */
export function diffVersionVectors(
  current: VersionVectorState = {},
  since: VersionVectorState = {},
): VersionVectorDelta {
  const delta: VersionVectorDelta = Object.create(null);

  for (const [replicaId, counter] of Object.entries(current)) {
    if (counter > (since[replicaId] ?? 0)) {
      delta[replicaId] = counter;
    }
  }

  return delta;
}

export class VersionVectorCRDT {
  private readonly replicaId: ReplicaId;
  private counters: VersionVectorState;

  constructor(options: VersionVectorOptions) {
    assertNonEmptyString(options.replicaId, 'replicaId');

    this.replicaId = options.replicaId;
    this.counters = Object.create(null);
  }

  /**
   * Records a local event and returns the resulting full version vector.
   *
   * Only this replica's component is incremented; all other components retain
   * the highest versions already observed.
   */
  increment(): VersionVectorState {
    const next = (this.counters[this.replicaId] ?? 0) + 1;

    this.counters[this.replicaId] = next;

    return this.getState();
  }

  /** Returns the current counter for a replica; absent replicas are zero. */
  get(replicaId: ReplicaId): number {
    assertNonEmptyString(replicaId, 'replicaId');

    return this.counters[replicaId] ?? 0;
  }

  /** Returns true when this vector has observed at least one event from `replicaId`. */
  has(replicaId: ReplicaId): boolean {
    return (this.counters[replicaId] ?? 0) > 0;
  }

  /** Returns every replica currently represented in the vector. */
  replicas(): ReplicaId[] {
    return Object.keys(this.counters);
  }

  /** Returns the number of replicas represented, including this replica after its first event. */
  size(): number {
    return Object.keys(this.counters).length;
  }

  /**
   * Merges a remote version vector.
   *
   * Applying the same vector twice has no additional effect.
   */
  merge(state: VersionVectorState): void {
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      throw new TypeError(
        'VersionVectorCRDT.merge expects a valid VersionVectorState.',
      );
    }

    this.counters = mergeVersionVectors(this.counters, state);
  }

  /** Merges a compact delta. Safe for duplicate and out-of-order delivery. */
  mergeDelta(delta: VersionVectorDelta | Array<VersionVectorDelta>): void {
    const deltas = Array.isArray(delta) ? delta : [delta];

    for (const item of deltas) {
      this.merge(item);
    }
  }

  /**
   * Returns only components newer than `since`.
   *
   * Use this for efficient synchronization after the initial exchange.
   */
  getDelta(since?: VersionVectorState): VersionVectorDelta {
    return diffVersionVectors(this.counters, since ?? {});
  }

  /** Returns a defensive copy of the complete version vector. */
  getState(): VersionVectorState {
    return cloneVersionVector(this.counters);
  }

  /** Compares this vector with another vector without modifying either. */
  compare(other: VersionVectorState): CausalRelationVector {
    return compareVersionVectors(this.counters, other);
  }

  /** Returns true when this vector contains every update in `other`. */
  dominates(other: VersionVectorState): boolean {
    return dominates(this.counters, other);
  }

  /**
   * Returns true when this vector has observed the event represented by
   * `(replicaId, counter)`.
   */
  observed(replicaId: ReplicaId, counter: number): boolean {
    assertNonEmptyString(replicaId, 'replicaId');
    assertCounter(counter, 'counter');

    return (this.counters[replicaId] ?? 0) >= counter;
  }

  /**
   * Removes replica entries whose counters are zero.
   *
   * This is safe only if zero means “no observed event”; it never removes a
   * nonzero causal-history entry.
   */
  compact(): number {
    let removed = 0;

    for (const [replicaId, counter] of Object.entries(this.counters)) {
      if (counter === 0) {
        delete this.counters[replicaId];
        removed++;
      }
    }

    return removed;
  }
}
