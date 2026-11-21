// #region ─── INSTANTIATE THE GENERIC WITH CONCRETE TYPES ───────────────────────────────
export function subst(ref, env) {
    switch (ref.kind) {
        case "Named":
            if (env[ref.name])
                return env[ref.name];
            return {
                kind: "Named",
                name: ref.name,
                args: ref.args?.map(a => subst(a, env)),
            };
        case "Union":
            return { kind: "Union", types: ref.types.map(t => subst(t, env)) };
        case "Function":
            return {
                kind: "Function",
                params: ref.params.map(p => ({ name: p.name, type: subst(p.type, env) })),
                returnType: subst(ref.returnType, env),
            };
        case "Object":
            const fields = {};
            for (const [k, v] of Object.entries(ref.fields)) {
                fields[k] = { type: subst(v.type, env), optional: v.optional };
            }
            return { kind: "Object", fields };
    }
}
export function instantiateConcentrationGeneric(generic, args) {
    const env = {};
    generic.typeParameters.forEach((p, i) => { env[p.name] = args[i]; });
    const sig = generic.signature;
    const instantiated = subst(sig, env);
    return instantiated;
}
export function instantiateConcentrationType(typeId, env, graph) {
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
// compile a spec from concentration_generics_init into a concentrationType
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
// #endregion
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
// #region ─── APPLY TYPE GRAPH ──────────────────────────────────────────────────────────
export function applyTypeGraph_incan_init(nodeDef, key, siblings, location) {
    // #region ── TYPE GRAPH ────────────────────────────────────────────────────────────────── 
    const concentrationTypeGraph = {};
    const enums = {};
    const interface_graph = {};
    const generic_graph = {};
    if (nodeDef.types && typeof nodeDef.types === "object") {
        for (const typeName in nodeDef.types) {
            const spec = nodeDef.types[typeName];
            if (!spec)
                continue;
            concentrationTypeGraph[typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.enum) {
        for (const typeName in nodeDef.enum) {
            const spec = nodeDef.enum[typeName];
            if (!spec)
                continue;
            enums[typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.interface && typeof nodeDef.interface === "object") {
        for (const typeName in nodeDef.interface) {
            const spec = nodeDef.interface[typeName];
            if (!spec)
                continue;
            interface_graph[typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    if (nodeDef.generic && typeof nodeDef.generic === "object") {
        for (const typeName in nodeDef.generic) {
            const spec = nodeDef.generic[typeName];
            if (!spec)
                continue;
            generic_graph[typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    nodeDef.__concentrationTypeGraph = concentrationTypeGraph;
    nodeDef.__concentrationEnumGraph = enums;
    nodeDef.__concentrationInterfaceGraph = interface_graph;
    nodeDef.__concentrationGenericGraph = generic_graph;
    nodeDef.types = concentrationTypeGraph;
    nodeDef.enum = enums;
    nodeDef.interface = interface_graph;
    nodeDef.generic = generic_graph;
    // #region ── GLOBAL ─────────────────────────────────────────────────────────
    if (nodeDef.global) {
        const globalContent = nodeDef.global();
        if (globalContent && typeof globalContent === 'object') {
            nodeDef.__globalContent = globalContent;
            nodeDef.__isGlobalized__ = true;
        }
    }
    // #endregion
    // #endregion
    nodeDef.__location = location;
    nodeDef.__definitionName = key;
    // #region ── GENERIC TYPE IN NODE ────────────────────────────────── 
    if (nodeDef.types?.GateDefinition) {
        nodeDef.__concentrationType = instantiateConcentrationType(`${key}.GateDefinition`, { TInput: "User", TOutput: "Result" }, concentrationTypeGraph);
    }
    if (nodeDef.types?.__concentrationTypeRef) {
        const { ref, args } = nodeDef.types.__concentrationTypeRef;
        const env = {};
        args.forEach((argName, idx) => { env[argName] = args[idx]; });
        nodeDef.__concentrationType = instantiateConcentrationType(ref, env, concentrationTypeGraph);
    }
    // #endregion
    // #region ── EXTEND ─────────────────────────────────────────────────────────
    if (nodeDef.extend && siblings[nodeDef.extend]) {
        const parentNode = siblings[nodeDef.extend];
        nodeDef = {
            ...parentNode,
            ...nodeDef,
            types: { ...(parentNode.types || {}), ...(nodeDef.types || {}) },
            enum: parentNode.enum || nodeDef.enum ? { ...(parentNode.enum || {}), ...(nodeDef.enum || {}) } : undefined,
            interface: { ...(parentNode.interface || {}), ...(nodeDef.interface || {}) },
            constants: parentNode.constants || nodeDef.constants ? { ...parentNode.constants, ...nodeDef.constants } : undefined,
        };
    }
    const ConcentrateInteraceGraph = {};
    const ConcentrateEnumeGraph = {};
    if (nodeDef.interface && typeof nodeDef.interface === "object") {
        for (const typeName in nodeDef.interface) {
            const spec = nodeDef.interface[typeName];
            if (!spec)
                continue;
            ConcentrateInteraceGraph[typeName] = compileConcentrationTypeSpecToConcentrationType(spec, `${key}.${typeName}`);
        }
    }
    nodeDef.__concentrationTypeGraph = concentrationTypeGraph;
    // #endregion
    return nodeDef;
}
// #endregion
