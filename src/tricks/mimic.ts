import type { AllIncantationTypes } from "./types";

  

  
  type AnyFn = (...args: any[]) => any;
  type AnyRecord = Record<PropertyKey, any>;
  type UnwrapFactory<C> = C extends (...args: any[]) => infer O ? O : C;
  type IsAny<T> = 0 extends 1 & T ? true : false;
  type NodeVariants<Node> = Node extends {variants: infer V} ? V : Node extends {__V__?: infer V} ? V : {};
  type NodeSlots<Node> = Node extends {slots: infer S} ? S : Node extends {__S__?: infer S} ? S : never;
  type NodeTypes<Node> = Node extends {types: infer T} ? T : Node extends {__T__?: infer T} ? T : unknown;
  type NodeInterfaces<Node> = Node extends {interfaces: infer I} ? I : Node extends {interface: infer I} ? I : Node extends {__I__?: infer I} ? I : unknown;
  type NodeEnums<Node> = Node extends {enums: infer E} ? E : Node extends {enum: infer E} ? E : Node extends {__E__?: infer E} ? E : unknown;
  type NodeConstants<Node> = Node extends {constants: infer C} ? C : Node extends {__C__?: infer C} ? C : unknown;
  type NodeSpecs<Node> = Node extends {specs: infer SP} ? SP : Node extends {__SP__?: infer SP} ? SP : unknown;
  type NodeSource<Node> = Node extends {source: infer SO} ? SO : Node extends {__SO__?: infer SO} ? SO : unknown;
  type NodeCloud<Node> = Node extends {cloud: infer CL} ? CL : Node extends {__CL__?: infer CL} ? CL : unknown;
  type NodeGenerics<Node> = Node extends {generics: infer G} ? G : Node extends {__G__?: infer G} ? G : unknown;
  type StringKey<T> = Extract<keyof T, string>;
  type VariantKeys<V> = {[K in keyof V]: V[K] extends object ? StringKey<V[K]> : never};
  type VariantPropsFrom<V> = IsAny<V> extends true ? Record<string, any> : V extends Record<string, object> ? {[K in keyof V]?: StringKey<V[K]> | null} : {};
  type SlotNames<S> = S extends Record<string, unknown> ? StringKey<S> : never;
  type SlotClasses<S> = S extends Record<string, unknown> ? Partial<Record<SlotNames<S>, ClassInput>> : Record<string, ClassInput>;
  type ExposedVariantGroup<V> = V extends Record<string, ClassInput> ? V & {extend(overrides: Partial<V>): V} : V;
  type ExposedVariantMap<V> = V extends Record<string, object> ? {[K in keyof V]: ExposedVariantGroup<V[K]>} : {};
  type VariantCallProps<Node> = VariantPropsFrom<NodeVariants<Node>> & NodeTypes<Node> & {animation?: string; preset?: string; class?: ClassInput; className?: ClassInput; __instanceId__?: string; freyr?: any};
  type SlotCallProps<Node> = VariantPropsFrom<NodeVariants<Node>> & {preset?: string; class?: SlotClasses<NodeSlots<Node>>; className?: SlotClasses<NodeSlots<Node>>; __instanceId__?: string; freyr?: any};
  type SlotResult<Node> = NodeSlots<Node> extends infer S ? (S extends Record<string, unknown> ? {[K in keyof S]: (extra?: ClassInput) => string} : {}) : {};
  
  type InferNodeReturn<Node> = string & {
      slots: (props?: SlotCallProps<Node>) => SlotResult<Node>;
      variants: ExposedVariantMap<NodeVariants<Node>>;
      types: NodeTypes<Node>;
      interfaces: NodeInterfaces<Node>;
      enums: NodeEnums<Node>;
      interface: NodeInterfaces<Node>;
      enum: NodeEnums<Node>;
      constants: NodeConstants<Node>;
      specs: NodeSpecs<Node>;
      source: NodeSource<Node>;
      cloud: NodeCloud<Node>;
      generics: NodeGenerics<Node>;
      extend: (overrides: Partial<Node>) => InferNodeReturn<Node>;
  } & VariantPropsFrom<NodeVariants<Node>>;
  
  type InferNode<Node> = Node extends AnyFn ? (ReturnType<Node> extends infer Produced ? InferNodeReturn<Produced> : never) : InferNodeReturn<Node>;
  
  export type IncantationsMimic<C> = UnwrapFactory<C> extends infer Produced ? Produced extends Record<string, any> ? { [K in keyof Produced]: InferNode<Produced[K]>; } & { incan_types: AllIncantationTypes; freyr: any; } : Record<string, any> : Record<string, any>;
  
  export type IncantationsMimicFactory<C> = C extends (...args: any[]) => any ? IncantationsMimic<C> : IncantationsMimic<C>;
  export type IncantationsMimicProps<C> = UnwrapFactory<C> extends Record<string, infer Node> ? VariantCallProps<Node> : Record<string, any>;
  
