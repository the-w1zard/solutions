// gset-crdt.ts
//
// Production-grade Grow-Only Set (G-Set) CRDT.
//
// Invariants:
// - Elements can be added but never removed.
// - add() is idempotent.
// - merge() is union: commutative, associative, and idempotent.
// - Deltas are safe to deliver more than once and in any order.
// - Element identity is based on a stable canonical serialization.

import { ElementKey, Json } from "./utils";
export interface GSetState {
  /** Canonical serialized elements currently in the set. */
  elements: ElementKey[];
}
export interface GSetDelta {
  /** Canonical serialized elements to union into the receiving replica. */
  elements: ElementKey[];
}
export interface GSetOptions {
  /**
   * Required for non-primitive elements.
   *
   * The serializer must return equivalent JSON for structurally equal
   * elements, or two logically identical objects can become distinct members.
   */
  serialize?: (value: unknown) => Json;
  /** Optional inverse of serialize(); used by values(). */
  deserialize?: (key: ElementKey) => unknown;
}
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value);
}
/** Deterministically serializes objects with sorted keys. */
function canonicalize(value: Json): Json {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (isPlainObject(value)) {
    const result: Record<string, Json> = Object.create(null);

    for (const key of Object.keys(value).sort()) {
      result[key] = canonicalize(value[key] as Json);
    }

    return result;
  }

  return value;
}
function defaultSerialize(value: unknown): Json {
  if (
    value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    return value as Json;
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return canonicalize(value as Json);
  }

  throw new TypeError(
    'GSet requires a serialize() option for non-JSON-safe elements.',
  );
}
function stableStringify(value: Json): ElementKey {
  return JSON.stringify(canonicalize(value));
}
export class GSet<T = unknown> {
  private readonly serialize: (value: T) => Json;
  private readonly deserialize?: (key: ElementKey) => T;

  /** Canonical element keys. A plain object is faster for membership checks. */
  private readonly elements: Set<ElementKey>;

  constructor(options: GSetOptions = {}) {
    this.serialize = (options.serialize ?? defaultSerialize) as (value: T) => Json;
    this.deserialize = options.deserialize as ((key: ElementKey) => T) | undefined;
    this.elements = new Set();
  }

  /**
   * Adds an element.
   *
   * Returns true when the element was newly added; returns false when it was
   * already present. Addition is intentionally idempotent.
   */
  add(value: T): boolean {
    const key = stableStringify(this.serialize(value));

    if (this.elements.has(key)) return false;

    this.elements.add(key);
    return true;
  }

  /** Adds many elements and returns the number that were newly added. */
  addAll(values: Iterable<T>): number {
    let added = 0;

    for (const value of values) {
      if (this.add(value)) added++;
    }

    return added;
  }

  has(value: T): boolean {
    return this.elements.has(stableStringify(this.serialize(value)));
  }

  hasKey(key: ElementKey): boolean {
    return this.elements.has(key);
  }

  size(): number {
    return this.elements.size;
  }

  /** Returns stable canonical keys for all elements. */
  keys(): ElementKey[] {
    return [...this.elements];
  }

  /** Returns deserialized elements. */
  values(): T[] {
    return this.keys().map(key =>
      this.deserialize
        ? this.deserialize(key)
        : (JSON.parse(key) as T),
    );
  }

  /** Returns canonical key/value pairs. */
  entries(): [ElementKey, T][] {
    return this.keys().map(key => [
      key,
      this.deserialize
        ? this.deserialize(key)
        : (JSON.parse(key) as T),
    ]);
  }

  /**
   * Merges another complete G-Set state.
   *
   * Merge is set union, making it commutative, associative, and idempotent.
   */
  merge(state: GSetState): void {
    if (!state || !Array.isArray(state.elements)) {
      throw new TypeError('GSet.merge expects a valid GSetState.');
    }

    for (const key of state.elements) {
      if (typeof key !== 'string') {
        throw new TypeError('GSetState.elements must contain string keys.');
      }

      this.elements.add(key);
    }
  }

  /**
   * Merges a delta.
   *
   * A delta can contain one element, many elements, or be empty. It can be
   * sent repeatedly without changing the resulting set.
   */
  mergeDelta(delta: GSetDelta | Array<GSetDelta>): void {
    const deltas = Array.isArray(delta) ? delta : [delta];

    for (const item of deltas) {
      this.merge(item);
    }
  }

  /**
   * Returns elements not present in `since`.
   *
   * Use this for incremental synchronization. The result is a valid G-Set
   * delta: applying it repeatedly has no additional effect.
   */
  getDelta(since?: GSetState): GSetDelta {
    const known = new Set(since?.elements ?? []);

    return {
      elements: this.keys().filter(key => !known.has(key)),
    };
  }

  /** Returns the complete state for persistence or initial synchronization. */
  getState(): GSetState {
    return {
      elements: this.keys(),
    };
  }

  /**
   * Creates a new G-Set containing the union of this set and another.
   *
   * Neither input is modified.
   */
  union(other: GSet<T>): GSet<T> {
    const result = new GSet<T>({
      serialize: this.serialize,
      deserialize: this.deserialize,
    });

    result.merge(this.getState());
    result.merge(other.getState());

    return result;
  }

  /**
   * Returns elements present in this set but not in `other`.
   *
   * This is a read-only set operation; it does not mutate either G-Set.
   */
  difference(other: GSet<T>): ElementKey[] {
    return this.keys().filter(key => !other.hasKey(key));
  }

  /**
   * Returns elements present in both sets.
   *
   * This is a read-only set operation; it does not mutate either G-Set.
   */
  intersection(other: GSet<T>): ElementKey[] {
    return this.keys().filter(key => other.hasKey(key));
  }

  /** Clears only this local in-memory representation. */
  clear(): void {
    this.elements.clear();
  }
}
