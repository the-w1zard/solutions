export function instantiateIncantationsType(typeId, env, graph) {
    const base = graph[typeId];
    if (!base)
        throw new Error(`Unknown type: ${typeId}`);
    // If it's a function with typeParameters, substitute them
    const instantiated = { ...base };
    if (base.signatures) {
        instantiated.signatures = base.signatures.map(sig => ({
            ...sig,
            typeParameters: sig.typeParameters,
            parameters: sig.parameters.map(p => ({
                ...p,
                type: env[p.type] ?? p.type,
            })),
            returnType: env[sig.returnType] ?? sig.returnType,
        }));
    }
    return instantiated;
}
export function compileIncantationsTypeSpecToIncantationsType(spec, id) {
    // minimal implementation for now: treat everything as a Function type
    const sig = {
        typeParameters: (spec.typeParameters || []).map((name) => ({
            id: `${id}.${name}`,
            name,
        })),
        parameters: (spec.parameters || []).map((p) => ({
            name: p.name,
            type: typeof p.type === "string" ? p.type : `${id}.${p.name}`,
        })),
        returnType: typeof spec.returnType === "string" ? spec.returnType : `${id}.return`,
    };
    return {
        id,
        name: spec.name || id,
        flags: ["Function"],
        signatures: [sig],
    };
}
export function node_types_enums_interfaces_generics(nodeDef, key) {
    const IncantationsTypeGraph = {};
    const enums = {};
    const interface_graph = {};
    const generic_graph = {};
    if (nodeDef.types && typeof nodeDef.types === "object") {
        for (const typeName in nodeDef.types) {
            const spec = nodeDef.types[typeName];
            if (!spec)
                continue;
            IncantationsTypeGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.enums) {
        for (const typeName in nodeDef.enums) {
            const spec = nodeDef.enums[typeName];
            if (!spec)
                continue;
            enums[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.interfaces && typeof nodeDef.interfaces === "object") {
        for (const typeName in nodeDef.interfaces) {
            const spec = nodeDef.interfaces[typeName];
            if (!spec)
                continue;
            interface_graph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.generics && typeof nodeDef.generics === "object") {
        for (const typeName in nodeDef.generics) {
            const spec = nodeDef.generics[typeName];
            if (!spec)
                continue;
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
    nodeDef.__IncantationsTypeGraph = IncantationsTypeGraph;
    if (nodeDef.__IncantationsTypeGraph && nodeDef.types?.GateDefinition) {
        const env = { TInput: "User", TOutput: "Result", };
        nodeDef.__IncantationsType = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__IncantationsTypeGraph);
    }
    if (nodeDef.__concentrationEnumGraph && nodeDef.enums?.GateDefinition) {
        const env = { TInput: "User", TOutput: "Result", };
        nodeDef.__IncantationsEnum = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationEnumGraph);
    }
    if (nodeDef.__concentrationInterfaceGraph && nodeDef.interfaces?.GateDefinition) {
        const env = { TInput: "User", TOutput: "Result", };
        nodeDef.__IncantationsInterface = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationInterfaceGraph);
    }
    if (nodeDef.__concentrationGenericGraph && nodeDef.generics?.GateDefinition) {
        const env = { TInput: "User", TOutput: "Result", };
        nodeDef.__IncantationsGeneric = instantiateIncantationsType(`${key}.GateDefinition`, env, nodeDef.__concentrationGenericGraph);
    }
    return nodeDef;
}
// #endregion
