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
    maxRuns?: number; // only relevant to repeat-all
    stopWhen?: (
      results: GateResult<unknown, unknown>[],
      run: number
    ) => boolean;
  };
  
  export async function AsyncGateSmasher<
    TValue,
    TResult = unknown,
    TGateMap extends GateMap<TValue, TResult> = GateMap<TValue, TResult>
  >(
    valueToEvalOn: TValue,
    getGates: () => TGateMap,
    options: GateSmasherOptions = {}
  ): Promise<GateResult<TValue, TResult>[]> {
    const {
      mode = "all",
      maxRuns = 1,
      stopWhen = () => false,
    } = options;
  
    if (maxRuns < 1) {
      throw new Error("GateSmasher: maxRuns must be at least 1.");
    }
  
    const allResults: GateResult<TValue, TResult>[] = [];
  
    for (let run = 1; run <= maxRuns; run++) {
      const gates = getGates();
      const runResults: GateResult<TValue, TResult>[] = [];
  
      for (const [key, gate] of Object.entries(gates)) {
        try {
          const matched = await gate.match(valueToEvalOn);
  
          if (!matched) {
            runResults.push({ key, matched: false });
            continue;
          }
  
          const result = await gate.execute(valueToEvalOn);
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
  
      // mode === "all": one pass through every gate
      break;
    }
  
    return allResults;
  }
  
