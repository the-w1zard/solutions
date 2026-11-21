import type { AllIncantationTypes } from "./types";
type MirrorImageAnyRecord = Record<PropertyKey, any>;
type AnyFunction = (...args: any[]) => any;
type MirrorImageUnwrapFactory<C> = C extends (...args: any[]) => infer Output ? Output : C;
type MirrorImageIsAny<T> = 0 extends 1 & T ? true : false;
type MirrorImageStringKey<T> = Extract<keyof T, string>;
export type MirrorImageVariantKeys<V> = {
    [K in keyof V]: V[K] extends object ? MirrorImageStringKey<V[K]> : never;
};
export type MirrorImageVariantPropsFrom<V> = MirrorImageIsAny<V> extends true ? MirrorImageAnyRecord : V extends Record<string, object> ? {
    [K in keyof V]?: MirrorImageStringKey<V[K]> | null;
} : {};
type MirrorImageNodeVariants<Node> = Node extends {
    variants: infer V;
} ? V : Node extends {
    __V__?: infer V;
} ? V : {};
type MirrorImageNodeSlots<Node> = Node extends {
    slots: infer S;
} ? S : Node extends {
    __S__?: infer S;
} ? S : never;
type MirrorImageNodeTypes<Node> = Node extends {
    types: infer T;
} ? T : Node extends {
    __T__?: infer T;
} ? T : unknown;
type MirrorImageNodeInterfaces<Node> = Node extends {
    interfaces: infer I;
} ? I : Node extends {
    interface: infer I;
} ? I : Node extends {
    __I__?: infer I;
} ? I : unknown;
type MirrorImageNodeEnums<Node> = Node extends {
    enums: infer E;
} ? E : Node extends {
    enum: infer E;
} ? E : Node extends {
    __E__?: infer E;
} ? E : unknown;
type MirrorImageNodeGenerics<Node> = Node extends {
    generics: infer G;
} ? G : Node extends {
    __G__?: infer G;
} ? G : unknown;
type MirrorImageNodeConstants<Node> = Node extends {
    constants: infer C;
} ? C : Node extends {
    __C__?: infer C;
} ? C : unknown;
type MirrorImageNodeSpecs<Node> = Node extends {
    specs: infer SP;
} ? SP : Node extends {
    __SP__?: infer SP;
} ? SP : unknown;
type MirrorImageNodeSource<Node> = Node extends {
    source: infer SO;
} ? SO : Node extends {
    __SO__?: infer SO;
} ? SO : unknown;
type MirrorImageNodeCloud<Node> = Node extends {
    cloud: infer CL;
} ? CL : Node extends {
    __CL__?: infer CL;
} ? CL : unknown;
type NodeName<Node> = Node extends {
    __S__?: infer S extends string;
} ? S : never;
type SlotsOf<Node> = MirrorImageNodeSlots<Node> extends Record<string, unknown> ? MirrorImageNodeSlots<Node> : {};
type MirrorImageSlotNames<Node> = MirrorImageStringKey<SlotsOf<Node>>;
type SlotClassProps<Node> = Partial<Record<MirrorImageSlotNames<Node>, ClassInput>>;
type MirrorImageSlotResult<Node> = {
    [K in MirrorImageSlotNames<Node>]: (extra?: ClassInput) => string;
};
type VariantGroup<V> = V extends Record<string, ClassInput> ? V & {
    extend(overrides: Record<string, ClassInput>): Record<string, ClassInput>;
} : V;
type ExposedVariantGroups<V> = V extends Record<string, object> ? {
    [K in keyof V]: VariantGroup<V[K]>;
} : {};
type NodeVariantProps<Node> = MirrorImageVariantPropsFrom<MirrorImageNodeVariants<Node>>;
type CommonCallProps<Node> = NodeVariantProps<Node> & {
    animation?: string;
    preset?: string;
    class?: ClassInput;
    className?: ClassInput;
    __instanceId__?: string;
    freyr?: any;
    [key: string]: any;
};
type NodeCallable<Node> = (props?: CommonCallProps<Node> & MirrorImageNodeTypes<Node>) => string;
type NodeSlotCallable<Node> = (props?: CommonCallProps<Node> & {
    class?: SlotClassProps<Node>;
    className?: SlotClassProps<Node>;
}) => MirrorImageSlotResult<Node>;
type NodeDefinition<Node> = NodeCallable<Node> & {
    __S__?: NodeName<Node>;
    __V__?: MirrorImageNodeVariants<Node>;
    __T__?: MirrorImageNodeTypes<Node>;
    __I__?: MirrorImageNodeInterfaces<Node>;
    __E__?: MirrorImageNodeEnums<Node>;
    __G__?: MirrorImageNodeGenerics<Node>;
    __C__?: MirrorImageNodeConstants<Node>;
    __SP__?: MirrorImageNodeSpecs<Node>;
    __SO__?: MirrorImageNodeSource<Node>;
    __CL__?: MirrorImageNodeCloud<Node>;
    base?: ClassInput;
    variants: ExposedVariantGroups<MirrorImageNodeVariants<Node>>;
    slots: NodeSlotCallable<Node>;
    types: MirrorImageNodeTypes<Node>;
    interfaces: MirrorImageNodeInterfaces<Node>;
    enums: MirrorImageNodeEnums<Node>;
    generics: MirrorImageNodeGenerics<Node>;
    interface: MirrorImageNodeInterfaces<Node>;
    enum: MirrorImageNodeEnums<Node>;
    constants: MirrorImageNodeConstants<Node>;
    specs: MirrorImageNodeSpecs<Node>;
    source: MirrorImageNodeSource<Node>;
    cloud: MirrorImageNodeCloud<Node>;
    compoundVariants?: NodeName<Node> extends never ? CompoundVariant[] : SlotCompoundVariant[];
    defaultVariants?: {
        [K in keyof MirrorImageNodeVariants<Node>]?: keyof MirrorImageNodeVariants<Node>[K];
    };
    animation?: any;
    transition?: any;
    styles?: any;
    inlineStyles?: any;
    classNames?: any;
    customTheme?: any;
    customCSS?: any;
    as?: Record<string, ClassInput>;
    docs?: any;
    aliases?: any;
    stateMachine?: any;
    logicMachine?: any;
    useMachine?: any;
    useTimeMachine?: any;
    variantMachine?: any;
    context?: any;
    useContext?: any;
    createContext?: any;
    sauronContext?: any;
    reactContext?: any;
    useReactContext?: any;
    _compiledReactContext?: any;
    global?: any;
    freyrClasses?: string;
    freyrIncantations?: any;
    __globalContent?: MirrorImageAnyRecord;
    __isGlobalized__?: boolean;
    meta?: any;
    staticMeta?: any;
    __location?: any;
    __definitionName?: string;
    extend(overrides: Partial<IncantationsConfig<any, any, any, any, any, any, any, any, any, any>>): NodeDefinition<Node>;
};
type InferConsumerNode<Node> = Node extends AnyFunction ? (MirrorImageUnwrapFactory<Node> extends infer Produced ? NodeDefinition<Produced> : never) : NodeDefinition<Node>;
type ConsumerObject<C> = MirrorImageUnwrapFactory<C> extends infer Produced ? (Produced extends MirrorImageAnyRecord ? Produced : {}) : {};
export type MirrorImage<C> = C extends AnyFunction ? {
    [K in keyof ConsumerObject<C>]: InferConsumerNode<ConsumerObject<C>[K]>;
} & {
    incan_types: AllIncantationTypes;
    freyr: any;
} : {
    [K in keyof ConsumerObject<C>]: InferConsumerNode<ConsumerObject<C>[K]>;
} & {
    incan_types: AllIncantationTypes;
    freyr: any;
};
export type MirrorImageTypeSurface = {
    [K in keyof AllIncantationTypes]: AllIncantationTypes[K];
};
export type MirrorImageFactory<C> = MirrorImage<C>;
export {};
