export const GRAPH_KEYS = ['types', 'enums', 'interfaces', 'generics'];
export function compileConcentrationTypeSpecToConcentrationType(spec, id) {
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
export function compileNodeGraphs(nodeDef, key) {
    const graphs = {
        types: {}, enums: {}, interfaces: {}, generics: {},
    };
    for (const graphKey of GRAPH_KEYS) {
        const source = nodeDef[graphKey];
        if (!source || typeof source !== 'object')
            continue;
        for (const typeName in source) {
            const spec = source[typeName];
            if (!spec)
                continue;
            graphs[graphKey][typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    return graphs;
}
