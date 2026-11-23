type GateResult<TValue, TResult> = {
    key: string;
    matched: boolean;
    result?: TResult;
    error?: unknown;
};
type Gate<TValue, TResult> = {
    match: (value: TValue) => boolean;
    execute: (value: TValue) => TResult;
};
type GateMap<TValue, TResult> = Record<string, Gate<TValue, TResult>>;
type GateSmasherMode = "all" | "first" | "repeat-all";
type GateSmasherOptions = {
    mode?: GateSmasherMode;
    maxRuns?: number;
    stopWhen?: (results: GateResult<unknown, unknown>[], run: number) => boolean;
};
declare function GateSmasher<TValue, TResult = unknown, TGateMap extends GateMap<TValue, TResult> = GateMap<TValue, TResult>>(valueToEvalOn: TValue, getGates: () => TGateMap, options?: GateSmasherOptions): GateResult<TValue, TResult>[];
export { GateSmasher };
export type { Gate, GateMap, GateResult, GateSmasherMode, GateSmasherOptions, };
