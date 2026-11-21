
// #region PRIMITIVE TYPES

const IncantationsConfig: IncantationsConfigCreator = (config) => config;
export type ObjectType = Record<string, IncantationsConfig<any, any, any, any, any, any, any, any, any, any>>;
export type SelfType = { self: any;[category: string]: any };
export type Factory = (ctx: SelfType) => ObjectType


export type AnySelfType = { self: any;[key: string]: any };
export type AnyObject = Record<string, any>;
export type AnyFactory = (ctx: AnySelfType) => AnyObject;
export type AnyType = AnyObject | AnyFactory;


export type AO = Record<string, any>;
export type AS = { self: any;[key: string]: any };
export type AF = (ctx: AS) => AnyObject;
export type AOAF = AnyObject | AnyFactory;


export type incan_vars_obj = Record<string, any>;
export type incan_vars_ctx = { self: any;[category: string]: any };
export type incan_vars_vault_factory = (ctx: incan_vars_ctx) => incan_vars_obj | incan_vars_obj;


export type ArcheTypeCtx = { self: any;[category: string]: any };



// #endregion ============================================
// #region FUNCTION TYPES
// ============================================
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


export type ClassInput =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassInput[]
  | Record<string, boolean | null | undefined>;
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


export type AsNode = Record<string, any> & { parent: string };

export type SlotRecord = Record<string, ClassInput>;

export type VariantSchema = Record<string, Record<string, ClassInput>>;



export type AnyVariantSchema =
  | VariantSchema
  | SlotVariantSchema;

export type AnimationPresetMap = Record<
  string,
  AnimationVariant | MotionVariant
>;

export type ExposedVariants = Record<string, VariantGroup>;

// #endregion ============================================
// #region BASE PROPS
// ============================================

export type BaseProps = {
  className?: string;
  class?: string;
  children?: any;
  style?: any;
  [key: string]: any;
};

// #endregion ============================================
// #region VARIANT GROUP
// ============================================

export type VariantGroup = Record<string, ClassInput> & {
  extend: (
    overrides: Record<string, ClassInput>
  ) => Record<string, ClassInput>;
};

// #endregion ============================================
// #region COMPOUND VARIANTS
// ============================================

export type CompoundVariant = {
  variants: Record<string, string>;
  className?: ClassInput;
  style?: A;
  class?: ClassInput;
};

export type SlotVariantSchema1 = Record<
  string,
  Record<string, SlotRecord>
>;

export type SlotVariantSchema = Record<string, Record<string, SlotRecord>>;

export type SlotCompoundVariant = {
  variants?: Record<string, string>;
  slots?: string[];
  class: ClassInput;
};


// #endregion ============================================
// #region STATE MACHINE
// ============================================

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

// #endregion ============================================
// #region MACHINE TYPES
// ============================================

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
  send: (
    variantKey: string,
    event: string,
    currentProps: any
  ) => Record<string, string> | undefined;
};

// #endregion ============================================
// #region VAULT TYPES
// ============================================

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
  variants?: { [variantKey: string]: { [entryKey: string]: string } };
};

export type VaultConfig = {
  vault?: VaultEntry;
  [key: string]: IncantationsConfig | VaultEntry | undefined;
};

// #endregion ============================================
// #region FREYR ENUMS
// ============================================

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

// #endregion ============================================
// #region INCANTATIONS LEVEL 3
// ============================================
export type variant_group = Record<string, ClassInput> & {
  extend: (
    overrides: Record<string, ClassInput>
  ) => Record<string, ClassInput>;
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
  variants?: { [variantKey: string]: { [entryKey: string]: string } };
};

// #endregion ============================================
// #region GENERIC INCANTATIONS CONFIG

export type IncantationsConfig<
  S extends string = never,
  V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>,
  T = unknown,
  I = unknown,
  E = unknown,
  C = unknown,
  SP = unknown,
  SO = unknown,
  CL = unknown,
  G = unknown
> = {
  // Identifiers
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
  // NEED TO WORK ON THESE
  timeMachine?: any
  useMachine?: any
  useTimeMachine?: any
  logicMachine?: any
  inlineStyles?: any
  theme?: any
  className?: any
  preset?: any
  __Incantations__?: any
  meta?: any
  staticMeta?: any
  machinesMachine?: any
  router?: any


  // Types
  enums?: E;
  types?: T;
  interfaces?: I;
  generics?: G;

  interface?: I;
  enum?: I;

  // Styles
  styles?: {
    base?: A;
    variants?: Record<string, Record<string, A>>;
    defaultVariants?: Record<string, string>;
  };
  slots?: Record<S, ClassInput>;
  // Freyr & Global
  global?: () => G;
  freyrClasses?: string;
  freyrIncantations?: A;
  __globalContent?: Record<string, any>;
  __isGlobalized__?: boolean;
  freyr?: IncantationsFreyr | ((props: any) => any);
  classNames?: ClassInput;
  customTheme?: ClassInput;
  customCSS?: any;
  // Variants
  variants?: V;
  compoundVariants?: S extends never ? CompoundVariant[] : SlotCompoundVariant[];
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
  base?: ClassInput;

  // Animations
  animation?: S extends never
  ? AnimationVariant | AnimationPresetMap
  : Record<S, AnimationVariant> | undefined;
  transition?: S extends never
  ? AnimationVariant | AnimationPresetMap
  : Record<S, AnimationVariant> | undefined;

  // Extend & Sync
  extend?: string;
  cloud?: CL;
  sync?: string;
  master?: boolean;

  // Context
  context?: (props: any) => any;
  useContext?: any;
  createContext?: any;
  sauronContext?: any;
  reactContext?: any;
  useReactContext?: any;
  _compiledReactContext?: any;

  // State Machines
  stateMachine?: { [K in keyof V]?: StateMachineConfig; };
  __logicMachineRunner?: any;
  getLogicState?: () => Record<string, string>;
  __machineRunner?: MachineRunner | null;
  getMachineState?: () => Record<string, string>;
  variantMachine?: any;



  // As
  as?: AsConfig;
  asName?: string;

  // Singles
  aliases?: { [K in keyof V]?: Record<string, keyof V[K]> };

  // Constants & Specs
  constants?: C;
  specs?: SP;
  source?: SO;

  // Documentation
  docs?: {
    [K in keyof V]?: {
      description?: string;
      values?: { [J in keyof V[keyof V]]?: string };
    };
  } & { description?: string };

  // Dev Tools
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
// #endregion ============================================
// #region TypeGraph  - Complete Type Introspection System

export type TypeFlags =
  | "Any"
  | "Unknown"
  | "Boolean"
  | "Number"
  | "String"
  | "Object"
  | "Array"
  | "Function"
  | "TypeParameter"
  | "Union"
  | "Intersection"
  | "Literal"
  | "Enum"
  | "Interface"
  | "Class"
  | "Generic"
  | "Record"
  | "Tuple"
  | "Optional"
  | "Nullable"
  | "Readonly";

export type TypeGraph = {
  // Core identification
  id?: string;
  name?: string;
  type: TypeFlags;
  kind?: "primitive" | "composite" | "reference" | "generic";

  // Value representation
  value?: any;
  defaultValue?: any;

  // Type structure
  properties?: Record<string, TypeGraph>;
  elements?: TypeGraph[];
  indexSignature?: TypeGraph;

  // Type parameters (generics)
  typeParameters?: TypeGraph[];
  typeArguments?: TypeGraph[];
  constraint?: TypeGraph;

  // Union/Intersection members
  unionMembers?: TypeGraph[];
  intersectionMembers?: TypeGraph[];

  // Function types
  parameters?: TypeGraph[];
  returnType?: TypeGraph;
  isAsync?: boolean;

  // Class/Interface
  extends?: TypeGraph[];
  implements?: TypeGraph[];
  constructors?: TypeGraph[];
  methods?: Record<string, TypeGraph>;
  accessors?: Record<string, TypeGraph>;

  // Enum
  enumMembers?: Record<string, string | number>;
  isStringEnum?: boolean;
  isNumericEnum?: boolean;

  // Record types
  keyType?: TypeGraph;
  valueType?: TypeGraph;

  // Tuple
  tupleElements?: TypeGraph[];
  isFixedLength?: boolean;
  restElement?: TypeGraph;

  // Modifiers
  isOptional?: boolean;
  isNullable?: boolean;
  isReadonly?: boolean;
  isAbstract?: boolean;
  isStatic?: boolean;

  // Generic constraints
  extendsConstraint?: TypeGraph;
  defaultType?: TypeGraph;

  // Metadata
  description?: string;
  tags?: Record<string, any>;
  source?: {
    file: string;
    line: number;
    column: number;
  };

  // Dependencies
  imports?: Record<string, string[]>;
  exports?: string[];
  references?: TypeGraph[];

  // Runtime info
  runtimeType?: any;
  validator?: (value: any) => boolean;
  serializer?: (value: any) => any;
  deserializer?: (value: any) => any;

  // Graph relationships
  parent?: TypeGraph;
  children?: TypeGraph[];
  dependencies?: TypeGraph[];

  // Custom metadata
  metadata?: Record<string, any>;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  version?: string;
};

// #endregion ============================================
// #region TYPE GRAPH UTILITIES
// ============================================

// Helper to create primitive types
export function createPrimitiveGraph(
  type: "String" | "Number" | "Boolean" | "Any" | "Unknown" | "Object",
  options?: Partial<TypeGraph>
): TypeGraph {
  return {
    type,
    kind: "primitive",
    ...options
  };
}

// Helper to create object type
export function createObjectGraph(
  properties: Record<string, TypeGraph>,
  options?: Partial<TypeGraph>
): TypeGraph {
  return {
    type: "Object",
    kind: "composite",
    properties,
    ...options
  };
}

// Helper to create array type
export function createArrayGraph(
  elementType: TypeGraph,
  options?: Partial<TypeGraph>
): TypeGraph {
  return {
    type: "Array",
    kind: "composite",
    elements: [elementType],
    ...options
  };
}

// Helper to create union type
export function createUnionGraph(
  members: TypeGraph[],
  options?: Partial<TypeGraph>
): TypeGraph {
  return {
    type: "Union",
    kind: "composite",
    unionMembers: members,
    ...options
  };
}

// Helper to create function type
export function createFunctionGraph(
  parameters: TypeGraph[],
  returnType: TypeGraph,
  options?: Partial<TypeGraph>
): TypeGraph {
  return {
    type: "Function",
    kind: "composite",
    parameters,
    returnType,
    ...options
  };
}

// Helper to create generic type
export function createGenericGraph(
  name: string,
  typeParameters: TypeGraph[],
  constraint?: TypeGraph,
  options?: Partial<TypeGraph>
): TypeGraph {
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
// #region TYPE GRAPH PREDICATES
// ============================================

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

// #endregion ============================================
// #region TYPE GRAPH TRANSFORMERS
// ============================================

export type TypeGraphTransformers = {
  // Traverse graph
  traverse: (
    graph: TypeGraph,
    visitor: (node: TypeGraph) => void
  ) => void;

  // Find nodes
  findNodes: (
    graph: TypeGraph,
    predicate: (node: TypeGraph) => boolean
  ) => TypeGraph[];

  // Transform nodes
  mapNodes: (
    graph: TypeGraph,
    mapper: (node: TypeGraph) => TypeGraph
  ) => TypeGraph;

  // Collect types
  collectTypes: (graph: TypeGraph) => Set<TypeFlags>;

  // Resolve references
  resolveReferences: (
    graph: TypeGraph,
    context: Record<string, TypeGraph>
  ) => TypeGraph;

  // Validate
  validate: (
    graph: TypeGraph,
    value: any
  ) => boolean;
};


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

const configGraph: TypeGraph = {
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
// #region IncantationsConfigCreator
export type IncantationsConfigCreator = <
  S extends string = never,
  V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>,
  T = unknown,
  I = unknown,
  E = unknown,
  C = unknown,
  SP = unknown,
  SO = unknown,
  CL = unknown,
  G = unknown
>(
  config: IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>
) => IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>;

// #endregion ============================================
// #region AllIncantationTypes
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

// #endregion ============================================

// #endregion ============================================
// #region INFER INCANTATIONS CONFIG
// ============================================

export type InferIncantationsConfig = <
  Cfg extends {
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
  }
>(
  config: Cfg
) => {
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

// #endregion ============================================
// #region VARIANT PROPS
// ============================================

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


// #endregion ============================================
// #region SLOTTED RESULT
// ============================================

export type SlottedResult<S extends string = string> = {
  [K in S]?: string;
} & {
  className?: string;
  class?: string;
  [key: string]: any;
};
// #endregion ============================================
// #region NAMESPACE AUGMENT
// ============================================

export type NamespaceAugment = any; // Define based on your implementation

// #endregion ============================================
// #region INCANTATIONS RESULT
// ============================================

// ============================================
// INCANTATIONS RESULT - Complete Type 
// (ALL properties from IncantationsConfig + React additions)
// ============================================

// ============================================
// INCANTATIONS RESULT - Fixed with proper constraints
// ============================================

export type IncantationsResult<
  S extends string = never,
  V extends Record<string, Record<string, any>> = Record<string, Record<string, any>>,
  T = unknown,
  I = unknown,
  E = unknown,
  C = unknown,
  SP = unknown,
  SO = unknown,
  CL = unknown,
  G = unknown
> = {
  // ── THE MAIN FUNCTION ────────────────────────────────────────────────────
  (props?: VariantProps & T & {
    animation?: keyof AnimationVariant | string;
    preset?: string;
    class?: any;
    className?: any;
    __instanceId__?: string;
    freyr?: FreyrConfig | ((props: any) => any);
  }): string;

  // ── IDENTIFIERS ──────────────────────────────────────────────────────────
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

  // ── TYPES ──────────────────────────────────────────────────────────────
  enums?: E;
  types?: T;
  interfaces?: I;
  generics?: G;

  // ── STYLES ──────────────────────────────────────────────────────────────
  styles?: {
    base?: A;
    variants?: Record<string, Record<string, A>>;
    defaultVariants?: Record<string, string>;
  };
  slots?: Record<S, ClassInput>;
  base?: ClassInput;

  // ── VARIANTS ──────────────────────────────────────────────────────────────
  variants?: V;
  compoundVariants?: S extends never ? CompoundVariant[] : SlotCompoundVariant[];
  defaultVariants?: { [K in keyof V]?: keyof V[K] };

  // ── ANIMATIONS ──────────────────────────────────────────────────────────
  animation?: S extends never
  ? AnimationVariant | AnimationPresetMap
  : Record<S, AnimationVariant> | undefined;
  transition?: S extends never
  ? AnimationVariant | AnimationPresetMap
  : Record<S, AnimationVariant> | undefined;

  // ── EXTEND & SYNC ──────────────────────────────────────────────────────
  extend?: string;
  cloud?: CL;
  sync?: string;
  master?: boolean;

  // ── CONTEXT ──────────────────────────────────────────────────────────────
  context?: (props: any) => any;
  useContext?: any;
  createContext?: any;
  sauronContext?: any;
  reactContext?: any;
  _compiledReactContext?: any;

  // ── STATE MACHINES ────────────────────────────────────────────────────
  stateMachine?: {
    [K in keyof V]?: StateMachineConfig;
  };
  logicMachine?: LogicMachine;
  __logicMachineRunner?: any;
  getLogicState?: () => Record<string, string>;
  __machineRunner?: MachineRunner | null;
  getMachineState?: () => Record<string, string>;
  variantMachine?: any;

  // ── FREYR & GLOBAL ──────────────────────────────────────────────────────
  global?: () => G;
  freyrClasses?: string;
  freyrIncantations?: A;
  __globalContent?: Record<string, any>;
  __isGlobalized__?: boolean;
  freyr?: IncantationsFreyr | ((props: any) => any);
  classNames?: any;
  customTheme?: any;
  customCSS?: any;

  // ── AS ──────────────────────────────────────────────────────────────────
  as?: AsConfig;
  asName?: string;

  // ── SINGLES ──────────────────────────────────────────────────────────────
  aliases?: { [K in keyof V]?: Record<string, keyof V[K]> };

  // ── CONSTANTS & SPECS ──────────────────────────────────────────────────
  constants?: C;
  specs?: SP;
  source?: SO;

  // ── DOCUMENTATION ──────────────────────────────────────────────────────
  docs?: {
    [K in keyof V]?: {
      description?: string;
      values?: { [J in keyof V[keyof V]]?: string };
    };
  } & { description?: string };

  // ── DEV TOOLS ──────────────────────────────────────────────────────────
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

  // ── REACT CONTEXT (Added by wizard template) ──────────────────────────
  ReactContext: A;
  createReactContext: (props?: any) => A;
  useReactContext: () => any;

  // ── SUB-COMPONENT UTILITIES ─────────────────────────────────────────────
  extendResult: (
    overrides: Partial<IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>>
  ) => IncantationsResult<S, V, T, I, E, C, SP, SO, CL, G>;
};
// #endregion ============================================
// #region INCANTATIONS RESULT CREATOR
// ============================================

export type IncantationsResultCreator = <
  S extends string = never,
  V extends AnyVariantSchema = any,
  T = unknown,
  I = unknown,
  C = unknown,
  SP = unknown,
  SO = unknown,
  CL = unknown,
  E = unknown,
  G = unknown
>(
  config: ((
    props?: VariantProps & T & {
      animation?: keyof AnimationVariant | string;
      preset?: string;
      class?: any;
      className?: any;
      __instanceId__?: string;
      freyr?: FreyrConfig | ((props: any) => any);
    }
  ) => string) & {
    // ── CORE HOOKS & PROCESSING ENGINE ──────────────────────────────────────
    slots: (
      props?: VariantProps & {
        preset?: string;
        class?: Partial<Record<S, ClassInput>>;
        className?: Partial<Record<S, ClassInput>>;
        __instanceId__?: string;
        freyr?: FreyrConfig | ((props: any) => any);
      }
    ) => SlottedResult<S>;

    // ── THE INLINE STYLES SYSTEM ───────────────────────────────────────────
    styles?: Record<string, any>;
    inlineStyles?: A;
    freyrClasses?: string;
    freyrIncantations?: A;
    classNames?: any;
    customTheme?: any;
    customCSS?: any;

    // ── BLUEPRINT ECHOES (CONFIG TO RESULT COPIES) ───────────────────────────
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

    // ── ADVANCED NESTED ENGINES ──────────────────────────────────────────────
    variantMachine?: Record<string, any>;
    transition?: {
      show?: Record<string, any>;
      hide?: Record<string, any>;
      [key: string]: any;
    };

    // ── SYSTEM MIGRATION & REACTION THREADS ──────────────────────────────────
    sync?: string;
    master?: boolean;
    context: (props: any, __sauron_id__?: string) => I;
    createContext?: any;
    sauronContext?: any;
    global: NamespaceAugment;

    // ── STATE ENGINE ACCESSORS (EXPOSED RUNTIMES) ────────────────────────────
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

    // ── GLOBALIZATION & COMPILER PROFILES ────────────────────────────────────
    __globalContent?: any;
    __isGlobalized__?: boolean;
    __location: string;
    __definitionName: string;

    // ── SUB-COMPONENT UTILITIES ─────────────────────────────────────────────
    extend: (
      overrides: Partial<IncantationsConfig<S, V, T, I, E, C, SP, SO, CL, G>>
    ) => IncantationsResult<S, V, T, I, C, SP, SO, CL, E, G>;
  }
) => IncantationsResult<S, V, T, I, C, SP, SO, CL, E, G>;


// #endregion ============================================

















