export type ObjectType = Record<string, IncantationsConfig<any, any, any, any, any, any, any, any, any, any>>;
export type SelfType = {
    self: any;
    [category: string]: any;
};
export type Factory = (ctx: SelfType) => ObjectType;
export type AnySelfType = {
    self: any;
    [key: string]: any;
};
export type AnyObject = Record<string, any>;
export type AnyFactory = (ctx: AnySelfType) => AnyObject;
export type AnyType = AnyObject | AnyFactory;
export type AO = Record<string, any>;
export type AS = {
    self: any;
    [key: string]: any;
};
export type AF = (ctx: AS) => AnyObject;
export type AOAF = AnyObject | AnyFactory;
export type incan_vars_obj = Record<string, any>;
export type incan_vars_ctx = {
    self: any;
    [category: string]: any;
};
export type incan_vars_vault_factory = (ctx: incan_vars_ctx) => incan_vars_obj | incan_vars_obj;
export type ArcheTypeCtx = {
    self: any;
    [category: string]: any;
};
export type vault_source = {
    variants?: Record<string, Record<string, any>>;
    base?: ClassInput;
    slots?: Record<string, ClassInput>;
    compoundVariants?: any[];
    defaultVariants?: Record<string, any>;
    animation?: any;
    aliases?: any;
};
export type base_props = {
    className?: string;
    class?: string;
    children?: any;
    style?: any;
    [key: string]: any;
};
export type ClassInput = string | number | boolean | null | undefined | ClassInput[] | Record<string, boolean | null | undefined>;
export type AsConfig = Record<string, ClassInput>;
export type AnimationVariant = {
    enter?: ClassInput;
    exit?: ClassInput;
    hover?: ClassInput;
    focus?: ClassInput;
    active?: ClassInput;
};
export type MotionVariant = {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    exit?: Record<string, any>;
    transition?: Record<string, any>;
    whileHover?: Record<string, any>;
    whileFocus?: Record<string, any>;
    whileTap?: Record<string, any>;
};
export type AsNode = Record<string, any> & {
    parent: string;
};
export type SlotRecord = Record<string, ClassInput>;
export type VariantSchema = Record<string, Record<string, ClassInput>>;
export type AnyVariantSchema = VariantSchema | SlotVariantSchema;
export type AnimationPresetMap = Record<string, AnimationVariant | MotionVariant>;
export type ExposedVariants = Record<string, VariantGroup>;
export type BaseProps = {
    className?: string;
    class?: string;
    children?: any;
    style?: any;
    [key: string]: any;
};
export type VariantGroup = Record<string, ClassInput> & {
    extend: (overrides: Record<string, ClassInput>) => Record<string, ClassInput>;
};
export type CompoundVariant = {
    variants: Record<string, string>;
    className?: ClassInput;
    style?: A;
    class?: ClassInput;
};
export type SlotVariantSchema1 = Record<string, Record<string, SlotRecord>>;
export type SlotVariantSchema = Record<string, Record<string, SlotRecord>>;
export type SlotCompoundVariant = {
    variants?: Record<string, string>;
    slots?: string[];
    class: ClassInput;
};
export interface StateMachineConfig1 {
    [ComponentVariantKey: string]: {
        initial: string;
        transitions: Record<string, string[]>;
        guards?: Record<string, (props: any, prev: string, next: string) => boolean>;
        onEnter?: Record<string, (props: any, prev: string, next: string) => void>;
        onExit?: Record<string, (props: any, prev: string, next: string) => void>;
        onTransition?: (props: any, prev: string, next: string) => void;
    };
}
export interface StateMachineConfig {
    initial: string;
    transitions: Record<string, string[]>;
    guards?: Record<string, (props: any, prev: string, next: string) => boolean>;
    onEnter?: Record<string, (props: any, prev: string, next: string) => void>;
    onExit?: Record<string, (props: any, prev: string, next: string) => void>;
    onTransition?: (props: any, prev: string, next: string) => void;
}
export type MachineState = {
    currentState: Record<string, string>;
};
export type LogicMachine = {
    [logicalState: string]: {
        ON?: Record<string, string>;
        ASYNC_GUARD?: (props: any) => Promise<any> | boolean;
        actions?: string[];
    };
};
export type MachineRunner = {
    states: Record<string, string>;
    send: (variantKey: string, event: string, currentProps: any) => Record<string, string> | undefined;
};
export type VaultSource = {
    variants?: Record<string, Record<string, any>>;
    base?: ClassInput;
    slots?: Record<string, ClassInput>;
    compoundVariants?: any[];
    defaultVariants?: Record<string, any>;
    animation?: any;
    aliases?: any;
};
export type VaultEntry = {
    source: VaultSource;
    variants?: {
        [variantKey: string]: {
            [entryKey: string]: string;
        };
    };
};
export type VaultConfig = {
    vault?: VaultEntry;
    [key: string]: IncantationsConfig | VaultEntry | undefined;
};
export type FreyrMode = "light" | "dark" | "system" | string;
export type FreyrTheme = "default" | "ocean" | "forest" | "sunset" | string;
export type FreyrVersion = "v1" | "v2" | "v3" | string;
export type FreyrFonts = "sans" | "serif" | "mono" | string;
export type FreyrPresets = "minimal" | "modern" | "vintage" | string;
export type IncantationsFreyrContext = {
    theme: FreyrTheme;
    version: FreyrVersion;
    mode: FreyrMode;
};
export type IncantationsFreyr = {
    mode?: FreyrMode;
    theme?: FreyrTheme;
    version?: FreyrVersion;
    fonts?: FreyrFonts;
    presets?: FreyrPresets;
};
export type variant_group = Record<string, ClassInput> & {
    extend: (overrides: Record<string, ClassInput>) => Record<string, ClassInput>;
};
export type IncantationsLvl3 = {
    db: any;
    bus: any;
    form: any;
    rdb: any;
    loader: any;
    session_mgmt: any;
    signals: any;
    jobs: any;
    fetch: any;
    sauron: any;
    htmx: any;
    cloud: any;
    cron: any;
    action: any;
    auth: any;
    realtime: any;
    reflect: any;
};
export type vault_entry = {
    source: vault_source;
    variants?: {
        [variantKey: string]: {
            [entryKey: string]: string;
        };
    };
};
export type IncantationsConfig<S extends string = never, V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>, T = unknown, I = unknown, E = unknown, C = unknown, SP = unknown, SO = unknown, CL = unknown, G = unknown> = {
    __S__?: S;
    __V__?: V;
    __T__?: T;
    __I__?: I;
    __E__?: E;
    __C__?: C;
    __SP__?: SP;
    __SO__?: SO;
    __CL__?: CL;
    __G__?: G;
    timeMachine?: any;
    useMachine?: any;
    useTimeMachine?: any;
    logicMachine?: any;
    inlineStyles?: any;
    theme?: any;
    className?: any;
    preset?: any;
    __Incantations__?: any;
    meta?: any;
    staticMeta?: any;
    machinesMachine?: any;
    router?: any;
    enums?: E;
    types?: T;
    interfaces?: I;
    generics?: G;
    interface?: I;
    enum?: I;
    styles?: {
        base?: A;
        variants?: Record<string, Record<string, A>>;
        defaultVariants?: Record<string, string>;
    };
    slots?: Record<S, ClassInput>;
    global?: () => G;
    freyrClasses?: string;
    freyrIncantations?: A;
    __globalContent?: Record<string, any>;
    __isGlobalized__?: boolean;
    freyr?: IncantationsFreyr | ((props: any) => any);
    classNames?: ClassInput;
    customTheme?: ClassInput;
    customCSS?: any;
    variants?: V;
    compoundVariants?: S extends never ? CompoundVariant[] : SlotCompoundVariant[];
    defaultVariants?: {
        [K in keyof V]?: keyof V[K];
    };
    base?: ClassInput;
    animation?: S extends never ? AnimationVariant | AnimationPresetMap : Record<S, AnimationVariant> | undefined;
    transition?: S extends never ? AnimationVariant | AnimationPresetMap : Record<S, AnimationVariant> | undefined;
    extend?: string;
    cloud?: CL;
    sync?: string;
    master?: boolean;
    context?: (props: any) => any;
    useContext?: any;
    createContext?: any;
    sauronContext?: any;
    reactContext?: any;
    useReactContext?: any;
    _compiledReactContext?: any;
    stateMachine?: {
        [K in keyof V]?: StateMachineConfig;
    };
    __logicMachineRunner?: any;
    getLogicState?: () => Record<string, string>;
    __machineRunner?: MachineRunner | null;
    getMachineState?: () => Record<string, string>;
    variantMachine?: any;
    as?: AsConfig;
    asName?: string;
    aliases?: {
        [K in keyof V]?: Record<string, keyof V[K]>;
    };
    constants?: C;
    specs?: SP;
    source?: SO;
    docs?: {
        [K in keyof V]?: {
            description?: string;
            values?: {
                [J in keyof V[keyof V]]?: string;
            };
        };
    } & {
        description?: string;
    };
    __location?: {
        file: string;
        line: number;
        column: number;
        functionName: string;
    };
    __definitionName?: string;
    __concentrationEnumGraph?: Record<string, TypeGraph>;
    __concentrationInterfaceGraph?: Record<string, TypeGraph>;
    __concentrationGenericGraph?: Record<string, TypeGraph>;
    __IncantationsTypeGraph?: Record<string, TypeGraph>;
};
export type TypeFlags = "Any" | "Unknown" | "Boolean" | "Number" | "String" | "Object" | "Array" | "Function" | "TypeParameter" | "Union" | "Intersection" | "Literal" | "Enum" | "Interface" | "Class" | "Generic" | "Record" | "Tuple" | "Optional" | "Nullable" | "Readonly";
export type TypeGraph = {
    id?: string;
    name?: string;
    type: TypeFlags;
    kind?: "primitive" | "composite" | "reference" | "generic";
    value?: any;
    defaultValue?: any;
    properties?: Record<string, TypeGraph>;
    elements?: TypeGraph[];
    indexSignature?: TypeGraph;
    typeParameters?: TypeGraph[];
    typeArguments?: TypeGraph[];
    constraint?: TypeGraph;
    unionMembers?: TypeGraph[];
    intersectionMembers?: TypeGraph[];
    parameters?: TypeGraph[];
    returnType?: TypeGraph;
    isAsync?: boolean;
    extends?: TypeGraph[];
    implements?: TypeGraph[];
    constructors?: TypeGraph[];
    methods?: Record<string, TypeGraph>;
    accessors?: Record<string, TypeGraph>;
    enumMembers?: Record<string, string | number>;
    isStringEnum?: boolean;
    isNumericEnum?: boolean;
    keyType?: TypeGraph;
    valueType?: TypeGraph;
    tupleElements?: TypeGraph[];
    isFixedLength?: boolean;
    restElement?: TypeGraph;
    isOptional?: boolean;
    isNullable?: boolean;
    isReadonly?: boolean;
    isAbstract?: boolean;
    isStatic?: boolean;
    extendsConstraint?: TypeGraph;
    defaultType?: TypeGraph;
    description?: string;
    tags?: Record<string, any>;
    source?: {
        file: string;
        line: number;
        column: number;
    };
    imports?: Record<string, string[]>;
    exports?: string[];
    references?: TypeGraph[];
    runtimeType?: any;
    validator?: (value: any) => boolean;
    serializer?: (value: any) => any;
    deserializer?: (value: any) => any;
    parent?: TypeGraph;
    children?: TypeGraph[];
    dependencies?: TypeGraph[];
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    version?: string;
};
export declare function createPrimitiveGraph(type: "String" | "Number" | "Boolean" | "Any" | "Unknown" | "Object", options?: Partial<TypeGraph>): TypeGraph;
export declare function createObjectGraph(properties: Record<string, TypeGraph>, options?: Partial<TypeGraph>): TypeGraph;
export declare function createArrayGraph(elementType: TypeGraph, options?: Partial<TypeGraph>): TypeGraph;
export declare function createUnionGraph(members: TypeGraph[], options?: Partial<TypeGraph>): TypeGraph;
export declare function createFunctionGraph(parameters: TypeGraph[], returnType: TypeGraph, options?: Partial<TypeGraph>): TypeGraph;
export declare function createGenericGraph(name: string, typeParameters: TypeGraph[], constraint?: TypeGraph, options?: Partial<TypeGraph>): TypeGraph;
export type TypeGraphPredicates = {
    isPrimitive: (graph: TypeGraph) => boolean;
    isComposite: (graph: TypeGraph) => boolean;
    isGeneric: (graph: TypeGraph) => boolean;
    isUnion: (graph: TypeGraph) => boolean;
    isIntersection: (graph: TypeGraph) => boolean;
    isObject: (graph: TypeGraph) => boolean;
    isArray: (graph: TypeGraph) => boolean;
    isFunction: (graph: TypeGraph) => boolean;
    isEnum: (graph: TypeGraph) => boolean;
    isOptional: (graph: TypeGraph) => boolean;
    isNullable: (graph: TypeGraph) => boolean;
};
export type TypeGraphTransformers = {
    traverse: (graph: TypeGraph, visitor: (node: TypeGraph) => void) => void;
    findNodes: (graph: TypeGraph, predicate: (node: TypeGraph) => boolean) => TypeGraph[];
    mapNodes: (graph: TypeGraph, mapper: (node: TypeGraph) => TypeGraph) => TypeGraph;
    collectTypes: (graph: TypeGraph) => Set<TypeFlags>;
    resolveReferences: (graph: TypeGraph, context: Record<string, TypeGraph>) => TypeGraph;
    validate: (graph: TypeGraph, value: any) => boolean;
};
export type IncantationsConfigCreator = <S extends string = never, V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>, T = unknown, I = unknown, E = unknown, C = unknown, SP = unknown, SO = unknown, CL = unknown, G = unknown>(config: IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>) => IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>;
export type AllIncantationTypes = {
    ClassInput: ClassInput;
    AnimationVariant: AnimationVariant;
    MotionVariant: MotionVariant;
    AsConfig: AsConfig;
    AsNode: AsNode;
    SlotRecord: SlotRecord;
    VariantSchema: VariantSchema;
    SlotVariantSchema: SlotVariantSchema;
    AnyVariantSchema: AnyVariantSchema;
    AnimationPresetMap: AnimationPresetMap;
    ExposedVariants: ExposedVariants;
    BaseProps: BaseProps;
    VariantGroup: VariantGroup;
    CompoundVariant: CompoundVariant;
    SlotCompoundVariant: SlotCompoundVariant;
    StateMachineConfig: StateMachineConfig;
    MachineState: MachineState;
    LogicMachine: LogicMachine;
    MachineRunner: MachineRunner;
    VaultSource: VaultSource;
    VaultEntry: VaultEntry;
    VaultConfig: VaultConfig;
    IncantationsFreyrContext: IncantationsFreyrContext;
    IncantationsFreyr: IncantationsFreyr;
    IncantationsLvl3: IncantationsLvl3;
    TypeFlags: TypeFlags;
    IncantationsConfig: IncantationsConfig;
};
export type InferIncantationsConfig = <Cfg extends {
    __S__?: any;
    __V__?: any;
    __T__?: any;
    __I__?: any;
    __E__?: any;
    __C__?: any;
    __SP__?: any;
    __SO__?: any;
    __CL__?: any;
    __G__?: any;
}>(config: Cfg) => {
    S: Cfg["__S__"];
    V: Cfg["__V__"];
    T: Cfg["__T__"];
    I: Cfg["__I__"];
    E: Cfg["__E__"];
    C: Cfg["__C__"];
    SP: Cfg["__SP__"];
    SO: Cfg["__SO__"];
    CL: Cfg["__CL__"];
    G: Cfg["__G__"];
    Config: Cfg;
};
export type VariantProps = {
    [key: string]: any;
    animation?: string;
    preset?: string;
    class?: any;
    className?: any;
    __instanceId__?: string;
    freyr?: FreyrConfig | ((props: any) => any);
};
export type FreyrConfig = {
    mode?: FreyrMode;
    theme?: FreyrTheme;
    version?: FreyrVersion;
    fonts?: FreyrFonts;
    presets?: FreyrPresets;
};
export type SlottedResult<S extends string = string> = {
    [K in S]?: string;
} & {
    className?: string;
    class?: string;
    [key: string]: any;
};
export type NamespaceAugment = any;
export type IncantationsResult<S extends string = never, V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>, T = unknown, I = unknown, E = unknown, C = unknown, SP = unknown, SO = unknown, CL = unknown, G = unknown> = {
    (props?: VariantProps & T & {
        animation?: keyof AnimationVariant | string;
        preset?: string;
        class?: any;
        className?: any;
        __instanceId__?: string;
        freyr?: FreyrConfig | ((props: any) => any);
    }): string;
    __S__?: S;
    __V__?: V;
    __T__?: T;
    __I__?: I;
    __E__?: E;
    __C__?: C;
    __SP__?: SP;
    __SO__?: SO;
    __CL__?: CL;
    __G__?: G;
    enums?: E;
    types?: T;
    interfaces?: I;
    generics?: G;
    styles?: {
        base?: A;
        variants?: Record<string, Record<string, A>>;
        defaultVariants?: Record<string, string>;
    };
    slots?: Record<S, ClassInput>;
    base?: ClassInput;
    variants?: V;
    compoundVariants?: S extends never ? CompoundVariant[] : SlotCompoundVariant[];
    defaultVariants?: {
        [K in keyof V]?: keyof V[K];
    };
    animation?: S extends never ? AnimationVariant | AnimationPresetMap : Record<S, AnimationVariant> | undefined;
    transition?: S extends never ? AnimationVariant | AnimationPresetMap : Record<S, AnimationVariant> | undefined;
    extend?: string;
    cloud?: CL;
    sync?: string;
    master?: boolean;
    context?: (props: any) => any;
    useContext?: any;
    createContext?: any;
    sauronContext?: any;
    reactContext?: any;
    _compiledReactContext?: any;
    stateMachine?: {
        [K in keyof V]?: StateMachineConfig;
    };
    logicMachine?: LogicMachine;
    __logicMachineRunner?: any;
    getLogicState?: () => Record<string, string>;
    __machineRunner?: MachineRunner | null;
    getMachineState?: () => Record<string, string>;
    variantMachine?: any;
    global?: () => G;
    freyrClasses?: string;
    freyrIncantations?: A;
    __globalContent?: Record<string, any>;
    __isGlobalized__?: boolean;
    freyr?: IncantationsFreyr | ((props: any) => any);
    classNames?: any;
    customTheme?: any;
    customCSS?: any;
    as?: AsConfig;
    asName?: string;
    aliases?: {
        [K in keyof V]?: Record<string, keyof V[K]>;
    };
    constants?: C;
    specs?: SP;
    source?: SO;
    docs?: {
        [K in keyof V]?: {
            description?: string;
            values?: {
                [J in keyof V[keyof V]]?: string;
            };
        };
    } & {
        description?: string;
    };
    __location?: {
        file: string;
        line: number;
        column: number;
        functionName: string;
    };
    __definitionName?: string;
    __concentrationEnumGraph?: Record<string, TypeGraph>;
    __concentrationInterfaceGraph?: Record<string, TypeGraph>;
    __concentrationGenericGraph?: Record<string, TypeGraph>;
    __IncantationsTypeGraph?: Record<string, TypeGraph>;
    ReactContext: A;
    createReactContext: (props?: any) => A;
    useReactContext: () => any;
    extendResult: (overrides: Partial<IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>>) => IncantationsResult<S, V, T, I, E, C, SP, SO, CL, G>;
};
export type IncantationsResultCreator = <S extends string = never, V extends AnyVariantSchema = any, T = unknown, I = unknown, C = unknown, SP = unknown, SO = unknown, CL = unknown, E = unknown, G = unknown>(config: ((props?: VariantProps & T & {
    animation?: keyof AnimationVariant | string;
    preset?: string;
    class?: any;
    className?: any;
    __instanceId__?: string;
    freyr?: FreyrConfig | ((props: any) => any);
}) => string) & {
    slots: (props?: VariantProps & {
        preset?: string;
        class?: Partial<Record<S, ClassInput>>;
        className?: Partial<Record<S, ClassInput>>;
        __instanceId__?: string;
        freyr?: FreyrConfig | ((props: any) => any);
    }) => SlottedResult<S>;
    styles?: Record<string, any>;
    inlineStyles?: A;
    freyrClasses?: string;
    freyrIncantations?: A;
    classNames?: any;
    customTheme?: any;
    customCSS?: any;
    types: T;
    interface: I;
    enum: E;
    constants: C;
    specs: SP;
    source: SO;
    cloud: CL;
    as: AsConfig;
    variants: ExposedVariants;
    compoundVariants?: any[];
    defaultVariants?: Record<string, any>;
    aliases?: Record<string, string>;
    docs?: string;
    variantMachine?: Record<string, any>;
    transition?: {
        show?: Record<string, any>;
        hide?: Record<string, any>;
        [key: string]: any;
    };
    sync?: string;
    master?: boolean;
    context: (props: any, __sauron_id__?: string) => I;
    createContext?: any;
    sauronContext?: any;
    global: NamespaceAugment;
    stateMachine?: Record<string, any>;
    logicMachine?: Record<string, any>;
    __machineRunner?: any;
    __logicMachineRunner?: any;
    getMachineState?: () => Record<string, any>;
    getLogicState?: () => Record<string, any>;
    useMachine?: (props?: any) => {
        state: Record<string, any>;
        setState: (key: string, value: any) => void;
    } & Record<string, (value: any) => void>;
    __globalContent?: any;
    __isGlobalized__?: boolean;
    __location: string;
    __definitionName: string;
    extend: (overrides: Partial<IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>>) => IncantationsResult<S, V, T, I, C, SP, SO, CL, E, G>;
}) => IncantationsResult<S, V, T, I, C, SP, SO, CL, E, G>;
