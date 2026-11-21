//                                                                                          APPARATIONS 🡲
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export type DDD<T, U, X, Y> = // dispatch                                                                  🡪 X when T ⊆ U, else Y
  [T] extends [U]
  ? X
  : Y

export type GGG<T, U, Y, X> = // promise unwrap                                                            🡪 X if Promise<string>, else U
  T extends Promise<infer U extends string>
  ? X
  : U

export type SplitTT<S extends string, D extends string> = // string splitter                               🡪 'a.b.c' → ['a','b','c']
  S extends `${infer Head}${D}${infer Rest}`
  ? [Head, ...SplitTT<Rest, D>]
  : [S];

export type ShiftTT<T> = // tuple head-drop                                                                🡪 [a, ...R] → R
  T extends [any, ...infer R]
  ? R
  : never

export interface BuildeRRr { with(x: string): this }// fluent seam                                         🡪 returns `this` for chaining

export declare const brand: unique symbol;
export type BrandDD<T, B> = // nominal brand                                                               🡪 T, tagged with B
  T & { [brand]: B };

export type IsNeverrr<T> = // never detector                                                               🡪 true iff T is never 
  [T] extends [never]
  ? true
  : false;

export type XXXxx<K extends keyof T, T> = // selective getters                                             🡪 only K, getK(): T[K]
  { [P in K as `get${Capitalize<string & P>}`]: () => T[P] };

export type XXXX<T> = // full getters                                                                    🡪 all keys, getKey(): T[K]
  { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };

export type Partialll<T> = // optionalizer                                                                 🡪 every key becomes ?
  { [K in keyof T]?: T[K] };

//export type Uppercas<S extends string>  intrinsic  = // compiler intrinsic                                          🡪 'a' → 'A'

class Aaa {
  self(): this { return this }
}
class BB extends Aaa { } // polymorphic this                                                       🡪 subclass-preserving return
new BB().self() //                                                                                🡪 typed as B, not A

// #endregion
//                                                                              FOR THE 4 CHANNELS...
// #region ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

export type SZU<T = Promise<any>> = [T] extends [undefined]// value is undefined               ... undefined
  ? undefined
  : T

  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  //                                                MAYBE PROMISE, BUT ONLY WHEN VALUE DOES NOT EQ...
  // #region ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // return v !== undefined || v != null ? v as R : Promise.resolve(v) as Promise<R>   
 

      type MaybePromise<R = any> = R;//                                                      ... UNDEFINED
  function MaybePromise<R = any>(v: R): MaybePromise {// ... runtime check mirrors the type gate
    return v !== undefined ? v as R : Promise.resolve(v) as Promise<R> //                                                                             ... UNDEFINED 
}//                                                   ... await UNDEFINED
  //   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  //                                                MAYBE PROMISE, BUT ONLY WHEN VALUE DOES NOT EQ...
  // #region ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class CreateApparation {
  public f<const T>(x: T) { }

  public ff<T>(arr: T[], fallback: NoInfer<T>) { }

  public config =
    { a: 1, b: 'x' } satisfies Record<string, string | number>;

  public assert(x: unknown): asserts x is string { }

  public fff<T extends new (...args: any[]) => any>(Ctor: T) { }

  public ffff(...args: readonly [string, number]) { }
  // ══════════════════════════════════════════════════════════════════════════════════════════════════════════
  // #endregion
  public any<T>(): T { return {} as T; }//                                                        ... Creates a no-op for ANY type
  public anyGeneric<T = any>() { return {} as T }
  public anyProp<T = any>(v: T) { return v }
  public anyProp2<T>(v: any): T { return v }
  public anyProp3(v: any) { return v }
  public anyAs(v: string | undefined) { return v as any }
  public promise<T>(): Promise<T> { return Promise.resolve({} as T); }//                          ... Creates a no-op Promise
  public booleanPromise(): Promise<boolean> { return Promise.resolve(false); }//                  ... Creates a no-op boolean Promise
  public void(): void { }//                                                                       ... Creates a no-op void function 
  public func<T>(): () => T { return () => ({}) as T; }//                                         ... Creates a no-op function that returns T
  public funcVoid(): () => void { return () => { }; }//                                           ... Creates a no-op function that returns void
  public universal<T>(): T {//                                                                    ... Universal no-op with Proxy (handles method chaining)
    return new Proxy({} as any, {
      get: (target, prop) => {
        if (typeof prop === 'symbol') { return undefined; }
        const propName = prop as string;
        if (propName === 'then' || propName === 'catch' || propName === 'finally') {
          return undefined;
        }
        if (propName === Symbol.iterator as any) { return function* () { }; }
        if (propName === 'toString' || propName === 'valueOf') { return () => ''; }
        return (...args: any[]) => target;
      },
      set: () => true,
      deleteProperty: () => true,
      ownKeys: () => [],
      getOwnPropertyDescriptor: () => undefined,
      apply: (target, thisArg, args) => target,
      construct: (target, args) => target
    }) as T;
  }
  public universalNoop<T>(): T {//                                                                ... Simple universal no-op that works for ANY type No TypeScript errors!
    // For primitive types, return appropriate defaults
    // Using type checking at runtime

    // Check if T is a function type
    // We can't check this at runtime easily, so we'll handle it via Proxy

    // Use Proxy for maximum compatibility
    return new Proxy({} as any, {
      get: (target, prop) => {
        // Handle symbols
        if (typeof prop === 'symbol') { return undefined; }
        // Handle common properties
        const propName = prop as string;
        // For Promise-like behavior
        if (propName === 'then' || propName === 'catch' || propName === 'finally') { return undefined; }
        // For iteration
        if (propName === Symbol.iterator as any) { return function* () { }; }
        // For toString
        if (propName === 'toString' || propName === 'valueOf') { return () => ''; }

        // For any other property, return a no-op function that returns the proxy
        // This allows chaining
        return (...args: any[]) => target;
      },
      set: () => true, // Silently ignore sets
      deleteProperty: () => true, // Silently ignore deletes
      ownKeys: () => [], // No own keys
      getOwnPropertyDescriptor: () => undefined,
      apply: (target, thisArg, args) => target, // For function calls
      construct: (target, args) => target // For 'new' calls
    }) as T;
  }
  public simpleNoop<T>(): T { return {} as T; }//                                                 ... Simpler version without Proxy (fewer errors)
  public noopPromise<T>(): Promise<T> { return Promise.resolve({} as T) }//                       ... For Promise specifically
  public noopBooleanPromise(): Promise<boolean> { return Promise.resolve(false); }//              ... For boolean Promise
  public noopVoid(): void { } //                                                                  ... For void functions
  public noopFunction<T>(): () => T { return () => ({}) as T; }//                                 ... For functions that return anything
  public thenable<T = any>(): PromiseLike<T> {//                                                  ... axis 2 first: thenable (promise-like, not necessarily Promise)
    return { then: (_onF?: any, _onR?: any) => new Promise<T>(() => { }) } as any;
  }
  public asyncIterable<T = any>(): AsyncIterable<T> {//                                           ... async iterable
    return { [Symbol.asyncIterator]: async function* () { await new Promise(() => { }); } } as any;
  }
  public null(): null { return null; }//                                                          ... null
  public primitive<T extends string | number | boolean | bigint | symbol | undefined>(): T {//    ... primitive: str/num/bool/bigint/sym/undefined
    return undefined as T;
  }
  public string(): string { return ''; }//                                                        ... string
  public number(): number { return 0; }//                                                         ... number
  public boolean(): boolean { return false; }//                                                   ... boolean
  public bigint(): bigint { return 0n; }//                                                        ... bigint
  public symbol(): symbol { return Symbol('apparation'); }//                                      ... symbol
  public undefined(): undefined { return undefined; }//                                           ... undefined
  public undefinedString(): string { return 'undefined'; }//                                      ... undefined string
  public function_(): (...args: any[]) => any { return () => { }; }//                             ... function
  public typedArray<T extends ArrayBufferView = Uint8Array>(): T {//                              ... TypedArray or DataView
    return new Uint8Array() as unknown as T;
  }
  public dataView(): DataView { return new DataView(new ArrayBuffer(0)); }//                      ... data view
  public arrayBuffer(): ArrayBuffer { return new ArrayBuffer(0); }//                              ... array buffer
  public map<K = any, V = any>(): Map<K, V> { return new Map<K, V>(); }//                         ... map
  public set<T = any>(): Set<T> { return new Set<T>(); }//                                        ... set
  public date(): Date { return new Date(0); }//                                                   ... date
  public regexp(): RegExp { return /(?:)/; }//                                                    ... regexp
  public error(msg = '[Apparation]'): Error { return new Error(msg); }//                          ... error
  public iterable<T = any>(): Iterable<T> { return [] as any; }//                                 ... iterable 
  public iterator<T = any>(): Iterator<T> { return [][Symbol.iterator](); }//                     ... iterator
  public object<T extends object = object>(): T { return {} as T; }//                             ... object 
  public plainObject<T extends object = Record<string, any>>(): T { return {} as T; }//           ... plainObject
  public array<T = any>(): T[] { return [] as T[]; }//                                            ... Array
  public weakMap<K extends object = object, V = any>(): WeakMap<K, V> {//                         ... WeakMap 
    return new WeakMap<K, V>();
  }
  public weakSet<T extends object = object>(): WeakSet<T> { return new WeakSet<T>(); }//          ... WeakSet
  public promiseInstance<T = any>(): Promise<T> { return Promise.resolve({} as T); }//            ... Promise
  public url(): URL { return new URL('about:blank'); }//                                          ... URL
  public urlSearchParams(): URLSearchParams { return new URLSearchParams(); }//                   ... URLSearchParams
  public buffer(): Buffer { return Buffer.alloc(0) }//                                            ... Buffer
  public _ArrayBuffer(): Uint8Array { return new Uint8Array(); }//                                 ... ArrayBuffer
}
const a = new CreateApparation
export { a, a as Apparation }
// #endregion
// #endregion
/**

🔹 interfaces, classes, objects, primitives                 🡆 any<T = any>() as T
Apparation.any<T>()                                         🡆 satisfies ANY type T
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Promise of any type                                      🡆 : Promise<T>
Apparation.promise<T>()                                     🡆 satisfies Promise<T>
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 common use case                                          🡆 : Promise<boolean>
Apparation.booleanPromise()                                 🡆 satisfies Promise<boolean>
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 no return value                                          🡆 : void
Apparation.void()                                           🡆 satisfies void
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Function that returns T                                  🡆 : () => T
Apparation.func<T>()                                        🡆 satisfies () => T
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Function that returns void                               🡆 : () => void 
Apparation.funcVoid()                                       🡆 satisfies () => void
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 ANY type with method chaining support                    🡆 new Proxy({} as any
Apparation.universal<T = any>()                             🡆 satisfies ANY type T (supports chaining)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 simpler version                                          🡆 <T = any>(): T { return {} as T }
Apparation.simpleNoop<T>()                                  🡆 satisfies ANY type T
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Promise of any type                                      🡆 : Promise<T> { return Promise.resolve({} as T) }
Apparation.noopPromise<T>()                                 🡆 satisfies Promise<T>
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Promise<boolean>                                         🡆 : Promise<boolean> { return Promise.resolve(false); }
Apparation.noopBooleanPromise()                             🡆 satisfies Promise<boolean>
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 void                                                     🡆 : void
Apparation.noopVoid()                                       🡆 satisfies void
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Function that returns T                                  🡆 <T>(): () => T { return () => ({}) as T; }
Apparation.noopFunction<T>()                                🡆 satisfies () => T 
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 axis 2 first: is it async?
   thenable (promise-like, not necessarily Promise)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 async iterable
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 null: null (typeof null === 'object', so separate)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 t !== 'object' && t !== 'function': 
   primitive: str/num/bool/bigint/sym/undefined
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 function
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 TypedArray or DataView
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 map
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 set
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 date
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 regexp
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 error
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 iterable
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 object
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 iterator
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 string
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 number
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 boolean
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 bigint
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 symbol
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 undefined
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Array
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 WeakMap
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 WeakSet
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Promise
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 ArrayBuffer
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 Buffer
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 URL
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 URLSearchParams
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 plainObject
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
🔹 For complicated types
 else {
      const msg = '[ENABLE_WS_DEV_SERVER is not set to true]'; console.log(msg);
      const universal = Apparation.universal<CSEAdapter>();
      type AdapterSendPayload = any;
      universal.send({ type: 'message', data: 'hello' } as AdapterSendPayload);
      universal.onMessage(() => { });
      universal.onConnect?.(() => { });
      universal.onDisconnect?.(() => { });
      return universal
    }

    else {
      const msg = '[ENABLE_WS_DEV_SERVER is not set to true]'; console.log(msg);
    }
*/

