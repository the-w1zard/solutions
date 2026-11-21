// #region ── GET CALLER LOCATION ────────────────────────────────────────────────────────────────── 
export function getCallerLocation(): { file: string; line: number; column: number; functionName: string } {
    const oldLimit = Error.stackTraceLimit
    Error.stackTraceLimit = 5
    const err = new Error()
    Error.stackTraceLimit = oldLimit

    const stack = err.stack || ""
    const lines = stack.split("\n")

    let callerLine = ""
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (
            line.includes("Incantations<") ||
            line.includes("Incantations_lvl2<") ||
            line.includes("Incantations_lvl3<") ||
            line.includes("Incantations_lvl4<") ||
            line.includes("Archetype<") ||
            line.includes("Archetype<") ||
            line.includes("Archetype_lvl2<") ||
            line.includes("Archetype_lvl3<") ||
            line.includes("Druid<") ||
            line.includes("Incantations_config<") ||
            line.includes("Incantations_vars<") ||
            line.includes("Vault<") ||
            line.includes("Valut_lvl2<") ||
            line.includes("Ward_lvl2<<") ||
            line.includes("Ward<") ||
            line.includes("APIWard<") ||
            line.includes("APIWard_lvl2<") ||
            line.includes("Golem<") ||
            line.includes("Golem_lvl2<") ||
            line.includes("Illusionist<") ||
            line.includes("Illusionist_lvl2<") ||
            line.includes("Incantations_Generics<") ||
            line.includes("Transmogrify_plugin<") ||
            line.includes("Conditions<") ||
            line.includes("Grimoire<") ||
            line.includes("Spellbook<") ||
            line.includes("Spellbook_lvl2<") ||
            line.includes("Transmogrify<") ||
            line.includes("RealmGrimoire<") ||
            line.includes("Apparation<") ||
            line.includes("GateMaster<") ||
            line.includes("GateMaster_lvl2<") ||
            line.includes("Concentration<") ||
            line.includes("Incantations_lvl2<")
        ) {
            callerLine = lines[i + 1] || ""
            break
        }
    }

    const match = callerLine.match(/\((.+):(\d+):(\d+)\)/)
    if (match) {
        const [, file, line, column] = match
        const cleanFile = file
            .replace(/^webpack:\/\/\/?/, "")
            .replace(/^file:\/\//, "")
            .replace(/^\//, "")
            .split("?")[0]

        return {
            file: cleanFile,
            line: parseInt(line, 10),
            column: parseInt(column, 10),
            functionName: callerLine.match(/at (\S+)/)?.[1] || "anonymous"
        }
    }

    return { file: "unknown", line: 0, column: 0, functionName: "unknown" }
}

// #endregion
