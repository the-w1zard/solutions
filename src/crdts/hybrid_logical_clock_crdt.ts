
    // ─────────────────────────────────────────────────────────────────────────────
// HLC — Hybrid Logical Clock
// ─────────────────────────────────────────────────────────────────────────────
//
// Wire format: `${wallTime}:${logical}:${nodeId}`
//   - wallTime:  ms since epoch (Number, integer)
//   - logical:   monotonic counter within the same wall ms (Number, integer)
//   - nodeId:    stable per-instance id (String, no ':' — see note)
//
// The string form is the canonical representation. Everything that crosses
// the bus (CRDT ops, event ordering, merge keys) is this string. The parsed
// tuple is only for computation — never stored, never sent.

/** Opaque HLC timestamp in wire format. */
 type HLCTimestamp = string;

/** Wire-format timestamp split into its three components. */
 type HLCParts = readonly [wall: number, logical: number, node: string];

/** The two numeric fields of an HLC — what `parseHLC` returns. */
 type HLCParsed = readonly [wall: number, logical: number];

/** Node identity — stable per HLC instance, unique across the mesh. */
 type HLCNodeId = string;

// ─────────────────────────────────────────────────────────────────────────────
// The class's public surface. This is what extensions call.
// ─────────────────────────────────────────────────────────────────────────────

 interface IHLC {
  /** Produce the next timestamp for a locally-originated event. */
  tick(): HLCTimestamp;

  /** Merge a remote timestamp into the local clock. */
  update(remote: HLCTimestamp): void;

  /** Total order — returns <0, 0, >0 like a standard comparator. */
  compare(a: HLCTimestamp, b: HLCTimestamp): number;
}

/** The static side of the HLC class — exposed as `fn.class` on the IIFE. */
 interface IHLCClass {
  new (nodeId?: string): IHLC;
  readonly MAX_SKEW_MS: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// The IIFE surface. `staff.HLC` is this — callable, with metadata attached.
// ─────────────────────────────────────────────────────────────────────────────

/** `staff.HLC()` — lazily constructs and returns the singleton instance. */
 type HLCFactory = (() => IHLC) & {
  /** The class itself. `staff.HLC.class` is the constructor. */
  class: IHLCClass;
  /** `staff.HLC.new()` — constructs a fresh instance (not the singleton). */
  new (): IHLC;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper function types. These are attached to the factory (`fn.splitHLC`,
// `fn.parseHLC`) so extensions can use them without importing.
// ─────────────────────────────────────────────────────────────────────────────

 type SplitHLC = (ts: HLCTimestamp) => HLCParts;
 type ParseHLC = (ts: HLCTimestamp) => HLCParsed;

/** Full surface of `staff.HLC` — callable + metadata + helpers. */
 type HLCSurface = HLCFactory & {
  splitHLC: SplitHLC;
  parseHLC: ParseHLC;
};


//                                                                                             RESOLVERS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════
function splitHLC(ts: string): [number, number, string] {
	const parts = ts.split(':')
	const wall = Number(parts[0])
	const logical = Number(parts[1])
	const node = parts[2] ?? ''
	return [Number.isFinite(wall) ? wall : 0, Number.isFinite(logical) ? logical : 0, node]
  }
  function parseHLC(ts: string): [number, number] {
	const [wall, logical] = splitHLC(ts)
	return [wall, logical]
  }
  
// ─────────────────────────────────────────────────────────────────────────────
// Type guards — useful at the bus boundary where anything can arrive.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structural check that a value looks like an HLC timestamp.
 * Not a validity check — `"9999999999999:9999:any"` passes. Use this at
 * bus boundaries to reject obvious garbage (nulls, non-strings, empty).
 */
export function isHLCTimestamp(v: unknown): v is HLCTimestamp {
  return typeof v === "string" && v.length > 0 && v.split(":").length >= 2;
}
 export  class HYBRID_LOGICAL_CLOCK_CRDT {
	private wallTime: number = 0;
	private logical: number = 0;
	private readonly nodeId: string;

	// Maximum skew we tolerate from a remote wall clock before clamping.
	// Honest nodes (NTP-synced, same LAN, same machine) are always well
	// under this. A hostile node can push us at most this far ahead, not
	// arbitrarily. Tune to your mesh's worst-case clock skew.
	private static readonly MAX_SKEW_MS = 60_000;

	constructor(nodeId?: string) {
		this.nodeId = nodeId ?? Math.random().toString(36).slice(2, 10);
	}

	// ── tick ──────────────────────────────────────────────────────────────
	// Produce the next timestamp for a locally-originated event.
	// Monotonic: each call returns a timestamp strictly greater than the
	// previous (per HLC ordering defined by `compare`).
	public tick(): string {
		const now = Date.now();
		if (now > this.wallTime) {
			this.wallTime = now;
			this.logical = 0;
		} else {
			this.logical++;
		}
		return this.stamp();
	}

	// ── update ────────────────────────────────────────────────────────────
	// Merge a remote timestamp. Two properties, both required for CRDT:
	//   1. Causal bump — after update(remote), our next tick is strictly
	//      greater than `remote`. That's the happens-before guarantee.
	//   2. Bounded adoption — a remote wall time more than MAX_SKEW_MS
	//      ahead of local `now` is clamped, so a lying/broken node can't
	//      drag our clock into the far future.
	// Both properties together: honest remotes get full causal adoption,
	// hostile remotes get bounded adoption.
	public update(remoteTimestamp: string): void {
		const [remoteWall, remoteLogical] = parseHLC(remoteTimestamp);
		if (!Number.isFinite(remoteWall) || !Number.isFinite(remoteLogical)) return;
		const now = Date.now();
		const adoptedWall = Math.min(remoteWall, now + HYBRID_LOGICAL_CLOCK_CRDT.MAX_SKEW_MS);

		if (adoptedWall > this.wallTime) {
			// Remote is ahead — adopt, and bump logical so our next tick is
			// strictly greater than the remote event.
			this.wallTime = adoptedWall;
			this.logical = remoteLogical + 1;
		} else if (adoptedWall === this.wallTime) {
			// Same wall — take the max of the two logicals, then bump.
			// (Not idempotent under at-least-once delivery — see note below —
			// but that's fine: over-advancing preserves causality.)
			this.logical = Math.max(this.logical, remoteLogical) + 1;
		} else if (now > this.wallTime) {
			// Remote is in the past; advance to wall-clock now.
			this.wallTime = now;
			this.logical = 0;
		}
		// Else: remote is behind and now <= wallTime → no change.
	}

	// ── compare ───────────────────────────────────────────────────────────
	// Total order over HLC timestamps. Every pair of distinct timestamps
	// returns nonzero. Deterministic across nodes because the nodeId
	// tiebreak is lexical, not arbitrary. Required for CRDT convergence:
	// without the third-field tiebreak, concurrent events at the same
	// (wall, logical) sort non-deterministically, and nodes disagree.
	public compare(a: string, b: string): number {
		const [wallA, logicalA, nodeA] = splitHLC(a);
		const [wallB, logicalB, nodeB] = splitHLC(b);
		if (wallA !== wallB) return wallA - wallB;
		if (logicalA !== logicalB) return logicalA - logicalB;
		return (nodeA ?? "").localeCompare(nodeB ?? "");
	}

	// ── helpers ───────────────────────────────────────────────────────────
	private stamp(): string {
		// Three-segment form is the canonical wire format. The nodeId
		// disambiguates concurrent events at the same (wall, logical) so
		// `compare` has a total order.
		return `${this.wallTime}:${this.logical}:${this.nodeId}`;
	}
};
// #endregion
