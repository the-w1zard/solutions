


export const GRAPH_KEYS = ['types', 'enums', 'interfaces', 'generics'] as const;


export function compileConcentrationTypeSpecToConcentrationType(spec: any, id: string): concentrationType {
    // minimal implementation for now: treat everything as a Function type
    const sig: concentrationSignature = {
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
export function compileNodeGraphs(nodeDef: any, key: string): Record<GraphKey, Record<string, concentrationType>> {
    const graphs: Record<GraphKey, Record<string, concentrationType>> = {
        types: {}, enums: {}, interfaces: {}, generics: {},
    };
    for (const graphKey of GRAPH_KEYS) {
        const source = nodeDef[graphKey];
        if (!source || typeof source !== 'object') continue;
        for (const typeName in source) {
            const spec = source[typeName];
            if (!spec) continue;
            graphs[graphKey][typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    return graphs;
}

