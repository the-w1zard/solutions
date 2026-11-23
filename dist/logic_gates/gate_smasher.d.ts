/**
 const results = GateSmasher(  { role: "admin" }, () => ({
    condition: {
      match: (e) => e.role === "admin",
      execute: () => "is admin",
    },
    condition_2: {
      match: (e) => e.role === "admin",
      execute: () => "is admin",
    },
  })
);
 */
type GateResult<TValue, TResult> = {
    key: string;
    matched: boolean;
    result?: TResult;
    error?: unknown;
};
type Gate<TValue, TResult> = {
    match: (value: TValue) => boolean | Promise<boolean>;
    execute: (value: TValue) => TResult | Promise<TResult>;
};
type GateMap<TValue, TResult> = Record<string, Gate<TValue, TResult>>;
type GateSmasherMode = "all" | "first" | "repeat-all";
type GateSmasherOptions = {
    mode?: GateSmasherMode;
    maxRuns?: number;
    stopWhen?: (results: GateResult<unknown, unknown>[], run: number) => boolean;
};
export declare function AsyncGateSmasher<TValue, TResult = unknown, TGateMap extends GateMap<TValue, TResult> = GateMap<TValue, TResult>>(valueToEvalOn: TValue, getGates: () => TGateMap, options?: GateSmasherOptions): Promise<GateResult<TValue, TResult>[]>;
export {};
