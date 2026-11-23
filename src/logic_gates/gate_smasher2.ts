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
    stopWhen?: (
      results: GateResult<unknown, unknown>[],
      run: number
    ) => boolean;
  };
  
  function GateSmasher<
    TValue,
    TResult = unknown,
    TGateMap extends GateMap<TValue, TResult> = GateMap<TValue, TResult>
  >(
    valueToEvalOn: TValue,
    getGates: () => TGateMap,
    options: GateSmasherOptions = {}
  ): GateResult<TValue, TResult>[] {
    const {
      mode = "all",
      maxRuns = 1,
      stopWhen = () => false,
    } = options;
  
    const allResults: GateResult<TValue, TResult>[] = [];
  
    for (let run = 1; run <= maxRuns; run++) {
      const gates = getGates();
      const runResults: GateResult<TValue, TResult>[] = [];
  
      for (const [key, gate] of Object.entries(gates)) {
        try {
          const matched = gate.match(valueToEvalOn);
  
          if (!matched) {
            runResults.push({ key, matched: false });
            continue;
          }
  
          const result = gate.execute(valueToEvalOn);
          runResults.push({ key, matched: true, result });
        } catch (error) {
          runResults.push({ key, matched: false, error });
        }
      }
  
      allResults.push(...runResults);
  
      if (mode === "first") {
        const firstMatch = runResults.find((entry) => entry.matched);
  
        if (firstMatch) {
          return [firstMatch];
        }
  
        if (run === maxRuns) break;
        continue;
      }
  
      if (mode === "repeat-all") {
        if (stopWhen(allResults, run)) break;
        if (run === maxRuns) break;
        continue;
      }
  
      break;
    }
  
    return allResults;
  }
  
  export { GateSmasher };
  export type {
    Gate,
    GateMap,
    GateResult,
    GateSmasherMode,
    GateSmasherOptions,
  };

