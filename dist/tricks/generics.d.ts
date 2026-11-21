export declare const GRAPH_KEYS: readonly ["types", "enums", "interfaces", "generics"];
export declare function compileConcentrationTypeSpecToConcentrationType(spec: any, id: string): concentrationType;
export declare function compileNodeGraphs(nodeDef: any, key: string): Record<GraphKey, Record<string, concentrationType>>;
