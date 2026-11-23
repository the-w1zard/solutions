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
export async function AsyncGateSmasher(valueToEvalOn, getGates, options = {}) {
    const { mode = "all", maxRuns = 1, stopWhen = () => false, } = options;
    if (maxRuns < 1) {
        throw new Error("GateSmasher: maxRuns must be at least 1.");
    }
    const allResults = [];
    for (let run = 1; run <= maxRuns; run++) {
        const gates = getGates();
        const runResults = [];
        for (const [key, gate] of Object.entries(gates)) {
            try {
                const matched = await gate.match(valueToEvalOn);
                if (!matched) {
                    runResults.push({ key, matched: false });
                    continue;
                }
                const result = await gate.execute(valueToEvalOn);
                runResults.push({ key, matched: true, result });
            }
            catch (error) {
                runResults.push({ key, matched: false, error });
            }
        }
        allResults.push(...runResults);
        if (mode === "first") {
            const firstMatch = runResults.find((entry) => entry.matched);
            if (firstMatch) {
                return [firstMatch];
            }
            if (run === maxRuns)
                break;
            continue;
        }
        if (mode === "repeat-all") {
            if (stopWhen(allResults, run))
                break;
            if (run === maxRuns)
                break;
            continue;
        }
        // mode === "all": one pass through every gate
        break;
    }
    return allResults;
}
