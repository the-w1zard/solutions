export declare function subst(ref: concentrationTypeRef, env: SubstEnv): concentrationTypeRef;
export declare function instantiateConcentrationGeneric(generic: concentrationGeneric, args: concentrationTypeRef[]): concentrationSignature;
export declare function instantiateConcentrationType(typeId: concentrationTypeId, env: concentrationTypeEnv, graph: Record<string, concentrationType>): concentrationType;
export declare function compileConcentrationTypeSpecToConcentrationType(spec: any, id: string): concentrationType;
export declare function compileNodeGraphs(nodeDef: any, key: string): Record<GraphKey, Record<string, concentrationType>>;
export declare function applyTypeGraph_incan_init(nodeDef: any, key: string, siblings: Record<string, any>, location: any): any;
