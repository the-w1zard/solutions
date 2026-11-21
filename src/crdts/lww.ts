//                                    LWW_REGISTER

import { HYBRID_LOGICAL_CLOCK } from "./hybrid_logical_clock";

// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
export interface HLCState { wall: number; logical: number; node: string; }
export interface LWWState<T = any> { value: T | undefined; stamp: string; _hlc?: HLCState; }
export class LWW_REGISTER<T> {
  private value: T | undefined;
  private stamp: string;

  constructor(private readonly nodeId: string, private readonly hlc: HYBRID_LOGICAL_CLOCK, initial?: T) {
    this.value = initial;
    this.stamp = this.hlc.tick();
  }

  set(value: T): void {
    this.value = value;
    this.stamp = this.hlc.tick();
  }

  get(): T | undefined {
    return this.value;
  }

  /** HLC.compare(), not Date.now() — this is what closes the "LWW depends on
   * synchronized clocks" gap flagged in research. HLC ties are broken by its
   * own embedded logical counter + node id, so two concurrent writes never
   * produce a genuine tie needing an arbitrary secondary rule. */
  merge(other: LWW_REGISTER<T> | LWWState<T>): void {
    const state = other instanceof LWW_REGISTER ? other.getState() : other;
    if (this.hlc.compare(state.stamp, this.stamp) > 0) {
      this.value = state.value;
      this.stamp = state.stamp;
    }
  }

  getState(): LWWState<T> {
    return { value: this.value, stamp: this.stamp };
  }

  setState(state: LWWState<T>): void {
    this.value = state.value;
    this.stamp = state.stamp;
  }
}

// #endregion
