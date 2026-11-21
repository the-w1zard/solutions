// #region ── TYPE GRAPH ────────────────────────────────────────────────────────────────── 
type IncantationsTypeFlags = | "Any" | "Unknown" | "Boolean" | "Number" | "String" | "Object" | "Function" | "TypeParameter" | "Union" | "Intersection"
type IncantationsTypeId = string
type IncantationsTypeParameter = {
    id: IncantationsTypeId
    name: string
    constraint?: IncantationsTypeId
    default?: IncantationsTypeId
}
type IncantationsSignature = {
    typeParameters?: IncantationsTypeParameter[]
    parameters: { name: string; type: IncantationsTypeId }[]
    returnType: IncantationsTypeId
}
type IncantationsType = {
    id: IncantationsTypeId
    flags: IncantationsTypeFlags[]
    name?: string
    signatures?: IncantationsSignature[]
    aliasOf?: IncantationsTypeId
}
type IncantationsTypeEnv = Record<string, IncantationsTypeId>
export function instantiateIncantationsType(
    typeId: IncantationsTypeId,
    env: IncantationsTypeEnv,
    graph: Record<string, IncantationsType>
): IncantationsType {
    const base = graph[typeId]
    if (!base) throw new Error(`Unknown type: ${typeId}`)

    // If it's a function with typeParameters, substitute them
    const instantiated: IncantationsType = { ...base }

    if (base.signatures) {
        instantiated.signatures = base.signatures.map(sig => ({
            ...sig,
            typeParameters: sig.typeParameters,
            parameters: sig.parameters.map(p => ({
                ...p,
                type: env[p.type] ?? p.type,
            })),
            returnType: env[sig.returnType] ?? sig.returnType,
        }))
    }

    return instantiated
}
export function compileIncantationsTypeSpecToIncantationsType(spec: any, id: string): IncantationsType {
    // minimal implementation for now: treat everything as a Function type
    const sig: IncantationsSignature = {
        typeParameters: (spec.typeParameters || []).map((name: string) => ({
            id: `${id}.${name}`,
            name,
        })),
        parameters: (spec.parameters || []).map((p: any) => ({
            name: p.name,
            type: typeof p.type === "string" ? p.type : `${id}.${p.name}`,
        })),
        returnType:
            typeof spec.returnType === "string" ? spec.returnType : `${id}.return`,
    }

    return {
        id,
        name: spec.name || id,
        flags: ["Function"],
        signatures: [sig],
    }
}
export function node_types_enums_interfaces_generics(nodeDef: any, key: any) {
    const IncantationsTypeGraph: Record<string, IncantationsType> = {}
    const enums: Record<string, IncantationsType> = {};
    const interface_graph: Record<string, IncantationsType> = {};
    const generic_graph: Record<string, IncantationsType> = {};
    if (nodeDef.types && typeof nodeDef.types === "object") {
        for (const typeName in nodeDef.types as any) {
            const spec = (nodeDef.types as any)[typeName]
            if (!spec) continue

            IncantationsTypeGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`)
        }
    }
    if (nodeDef.enums) {
        for (const typeName in nodeDef.enums) {
            const spec = nodeDef.enums[typeName];
            if (!spec) continue;
            enums[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.interfaces && typeof nodeDef.interfaces === "object") {
        for (const typeName in nodeDef.interfaces) {
            const spec = nodeDef.interfaces[typeName];
            if (!spec) continue;
            interface_graph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.generics && typeof nodeDef.generics === "object") {
        for (const typeName in nodeDef.generics) {
            const spec = nodeDef.generics[typeName];
            if (!spec) continue;
            generic_graph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    nodeDef.__concentrationEnumGraph = enums;
    nodeDef.__concentrationInterfaceGraph = interface_graph;
    nodeDef.__concentrationGenericGraph = generic_graph;
    nodeDef.types = IncantationsTypeGraph;
    nodeDef.enums = enums;
    nodeDef.interfaces = interface_graph;
    nodeDef.generics = generic_graph;
    nodeDef.__IncantationsTypeGraph = IncantationsTypeGraph
    if (nodeDef.__IncantationsTypeGraph && (nodeDef.types as any)?.GateDefinition) {
        const env: IncantationsTypeEnv = { TInput: "User", TOutput: "Result", }
        nodeDef.__IncantationsType = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__IncantationsTypeGraph)
    }
    if (nodeDef.__concentrationEnumGraph && (nodeDef.enums as any)?.GateDefinition) {
        const env: IncantationsTypeEnv = { TInput: "User", TOutput: "Result", }
        nodeDef.__IncantationsEnum = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationEnumGraph)
    }
    if (nodeDef.__concentrationInterfaceGraph && (nodeDef.interfaces as any)?.GateDefinition) {
        const env: IncantationsTypeEnv = { TInput: "User", TOutput: "Result", }
        nodeDef.__IncantationsInterface = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationInterfaceGraph)
    }
    if (nodeDef.__concentrationGenericGraph && (nodeDef.generics as any)?.GateDefinition) {
        const env: IncantationsTypeEnv = { TInput: "User", TOutput: "Result", }
        nodeDef.__IncantationsGeneric = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationGenericGraph)
    }
    return nodeDef
}
// #endregion
