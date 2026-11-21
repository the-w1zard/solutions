

export function applyTypeGraph(nodeDef: any, key: string): any {
    // #region ── TYPE GRAPH TYPES ──────────────────────────────────────────────────────────────────
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
    // #endregion
    function instantiateIncantationsType(
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
    // compile a spec from rune_generics into a IncantationsType
    function compileIncantationsTypeSpecToIncantationsType(spec: any, id: string): IncantationsType {
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
    const enumGraph: Record<string, IncantationsType> = {};
    const interfaceGraph: Record<string, IncantationsType> = {};
    const genericGraph: Record<string, IncantationsType> = {};
    const IncantationsTypeGraph: Record<string, IncantationsType> = {};
    if (nodeDef.types && typeof nodeDef.types === "object") {
        for (const typeName in nodeDef.types) {
            const spec = nodeDef.types[typeName];
            if (!spec) continue;
            IncantationsTypeGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.enum) {
        for (const typeName in nodeDef.enum) {
            const spec = nodeDef.enum[typeName];
            if (!spec) continue;
            enumGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.interface && typeof nodeDef.interface === "object") {
        for (const typeName in nodeDef.interface) {
            const spec = nodeDef.interface[typeName];
            if (!spec) continue;
            interfaceGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.generic && typeof nodeDef.generic === "object") {
        for (const typeName in nodeDef.generic) {
            const spec = nodeDef.generic[typeName];
            if (!spec) continue;
            genericGraph[typeName] = compileIncantationsTypeSpecToIncantationsType(spec, `${key}.${typeName}`);
        }
    }
    nodeDef.__IncantationsTypeGraph = IncantationsTypeGraph;
    nodeDef.__IncantationsEnumGraph = enumGraph;
    nodeDef.__IncantationsInterfaceGraph = interfaceGraph;
    nodeDef.__IncantationsGenericsGraph = genericGraph;
    nodeDef.enum = enumGraph;
    nodeDef.interface = interfaceGraph;
    nodeDef.generic = genericGraph;
    nodeDef.types = IncantationsTypeGraph;

    if (nodeDef.types?.GateDefinition) {
        nodeDef.__IncantationsType = instantiateIncantationsType(`${key}.GateDefinition`, { TInput: "User", TOutput: "Result" }, IncantationsTypeGraph);
    }
    if (nodeDef.types?.__IncantationsTypeRef) {
        const { ref, args } = nodeDef.types.__IncantationsTypeRef;
        const env: IncantationsTypeEnv = {};
        args.forEach((argName: string, idx: number) => { env[argName] = args[idx]; });
        nodeDef.__IncantationsType = instantiateIncantationsType(ref, env, IncantationsTypeGraph);
    }
    return nodeDef;
}
