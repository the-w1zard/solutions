type IncantationsTypeFlags = "Any" | "Unknown" | "Boolean" | "Number" | "String" | "Object" | "Function" | "TypeParameter" | "Union" | "Intersection";
type IncantationsTypeId = string;
type IncantationsTypeParameter = {
    id: IncantationsTypeId;
    name: string;
    constraint?: IncantationsTypeId;
    default?: IncantationsTypeId;
};
type IncantationsSignature = {
    typeParameters?: IncantationsTypeParameter[];
    parameters: {
        name: string;
        type: IncantationsTypeId;
    }[];
    returnType: IncantationsTypeId;
};
type IncantationsType = {
    id: IncantationsTypeId;
    flags: IncantationsTypeFlags[];
    name?: string;
    signatures?: IncantationsSignature[];
    aliasOf?: IncantationsTypeId;
};
type IncantationsTypeEnv = Record<string, IncantationsTypeId>;
export declare function instantiateIncantationsType(typeId: IncantationsTypeId, env: IncantationsTypeEnv, graph: Record<string, IncantationsType>): IncantationsType;
export declare function compileIncantationsTypeSpecToIncantationsType(spec: any, id: string): IncantationsType;
export declare function node_types_enums_interfaces_generics(nodeDef: any, key: any): any;
export {};
