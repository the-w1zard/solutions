// #region PRIMITIVE TYPES
const IncantationsConfig = (config) => config;
// #endregion ============================================
// #region TYPE GRAPH UTILITIES
// ============================================
// Helper to create primitive types
export function createPrimitiveGraph(type, options) {
    return {
        type,
        kind: "primitive",
        ...options
    };
}
// Helper to create object type
export function createObjectGraph(properties, options) {
    return {
        type: "Object",
        kind: "composite",
        properties,
        ...options
    };
}
// Helper to create array type
export function createArrayGraph(elementType, options) {
    return {
        type: "Array",
        kind: "composite",
        elements: [elementType],
        ...options
    };
}
// Helper to create union type
export function createUnionGraph(members, options) {
    return {
        type: "Union",
        kind: "composite",
        unionMembers: members,
        ...options
    };
}
// Helper to create function type
export function createFunctionGraph(parameters, returnType, options) {
    return {
        type: "Function",
        kind: "composite",
        parameters,
        returnType,
        ...options
    };
}
// Helper to create generic type
export function createGenericGraph(name, typeParameters, constraint, options) {
    return {
        type: "Generic",
        kind: "generic",
        name,
        typeParameters,
        constraint,
        ...options
    };
}
// #endregion ============================================
// #region EXAMPLE USAGE
// ============================================
// Example: Build a type graph for a config
const stringType = createPrimitiveGraph("String");
const numberType = createPrimitiveGraph("Number");
const booleanType = createPrimitiveGraph("Boolean");
const variantSchemaGraph = createObjectGraph({
    size: createUnionGraph([
        createPrimitiveGraph("String", { value: "small" }),
        createPrimitiveGraph("String", { value: "large" })
    ]),
    color: createUnionGraph([
        createPrimitiveGraph("String", { value: "red" }),
        createPrimitiveGraph("String", { value: "blue" })
    ])
});
const configGraph = {
    type: "Interface",
    kind: "composite",
    name: "IncantationsConfig",
    properties: {
        variants: variantSchemaGraph,
        defaultVariants: createObjectGraph({
            size: createPrimitiveGraph("String", { defaultValue: "small" })
        })
    },
    typeParameters: [
        {
            type: "TypeParameter",
            name: "S",
            constraint: createPrimitiveGraph("String")
        },
        {
            type: "TypeParameter",
            name: "V",
            constraint: createPrimitiveGraph("Object")
        }
    ]
};
// #endregion ============================================
