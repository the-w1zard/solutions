//                                    OR_SET

import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";


// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export interface ORSetState<T = any> { adds: { item: T; tag: string; }[]; removes: { item: T; tag: string; }[]; }

export class OR_SET<T = any> {
  private adds = new Map<string, { item: T; tag: string }>();   // tag -> entry
  private removes = new Set<string>();                          // tags known removed

  constructor(private readonly nodeId: string, private readonly hlc: HYBRID_LOGICAL_CLOCK) { }

  add(item: T): void {
    const tag = `${this.hlc.tick()}:${this.nodeId}`;
    this.adds.set(tag, { item, tag });
  }

  /** Removes every currently-visible tag for this item — a concurrent add on
   * another node produces a NEW tag this remove never saw, so it survives.
   * That's the actual OR-Set guarantee: add wins over a remove it wasn't
   * causally aware of. */
  remove(item: T): void {
    for (const [tag, entry] of this.adds) {
      if (this.equals(entry.item, item)) this.removes.add(tag);
    }
  }

  has(item: T): boolean {
    for (const [tag, entry] of this.adds) {
      if (this.equals(entry.item, item) && !this.removes.has(tag)) return true;
    }
    return false;
  }

  values(): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const [tag, entry] of this.adds) {
      if (this.removes.has(tag)) continue;
      const key = JSON.stringify(entry.item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(entry.item);
    }
    return out;
  }

  /** Union of add-sets and remove-sets — both only ever grow. Tombstone
   * accumulation is real and disclosed, not solved here (see class header
   * gap on GC — no automatic pruning, matches the field guide's stated
   * concern that this is one of the hardest practical CRDT problems). */
  merge(other: OR_SET<T> | ORSetState<T>): void {
    const state = other instanceof OR_SET ? other.getState() : other;
    for (const entry of state.adds) if (!this.adds.has(entry.tag)) this.adds.set(entry.tag, entry);
    for (const entry of state.removes) this.removes.add(entry.tag);
  }

  getState(): ORSetState<T> {
    return {
      adds: Array.from(this.adds.values()),
      removes: Array.from(this.removes).map((tag) => ({ item: this.adds.get(tag)?.item as T, tag })),
    };
  }

  setState(state: ORSetState<T>): void {
    this.adds = new Map(state.adds.map((e) => [e.tag, e]));
    this.removes = new Set(state.removes.map((r) => r.tag));
  }

  private equals(a: T, b: T): boolean {
    return typeof a === 'object' ? JSON.stringify(a) === JSON.stringify(b) : a === b;
  }
}
// #endregion
