export type DDD<T, U, X, Y> = [
    T
] extends [U] ? X : Y;
export type GGG<T, U, Y, X> = T extends Promise<infer U extends string> ? X : U;
export type SplitTT<S extends string, D extends string> = S extends `${infer Head}${D}${infer Rest}` ? [Head, ...SplitTT<Rest, D>] : [S];
export type ShiftTT<T> = T extends [any, ...infer R] ? R : never;
export interface BuildeRRr {
    with(x: string): this;
}
export declare const brand: unique symbol;
export type BrandDD<T, B> = // nominal brand                                                               🡪 T, tagged with B
T & {
    [brand]: B;
};
export type IsNeverrr<T> = [
    T
] extends [never] ? true : false;
export type XXXxx<K extends keyof T, T> = {
    [P in K as `get${Capitalize<string & P>}`]: () => T[P];
};
export type XXXX<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
export type Partialll<T> = {
    [K in keyof T]?: T[K];
};
export type SZU<T = Promise<any>> = [T] extends [undefined] ? undefined : T;
export declare class CreateApparation {
    f<const T>(x: T): void;
    ff<T>(arr: T[], fallback: NoInfer<T>): void;
    config: {
        a: number;
        b: string;
    };
    assert(x: unknown): asserts x is string;
    fff<T extends new (...args: any[]) => any>(Ctor: T): void;
    ffff(...args: readonly [string, number]): void;
    any<T>(): T;
    anyGeneric<T = any>(): T;
    anyProp<T = any>(v: T): T;
    anyProp2<T>(v: any): T;
    anyProp3(v: any): any;
    anyAs(v: string | undefined): any;
    promise<T>(): Promise<T>;
    booleanPromise(): Promise<boolean>;
    void(): void;
    func<T>(): () => T;
    funcVoid(): () => void;
    universal<T>(): T;
    universalNoop<T>(): T;
    simpleNoop<T>(): T;
    noopPromise<T>(): Promise<T>;
    noopBooleanPromise(): Promise<boolean>;
    noopVoid(): void;
    noopFunction<T>(): () => T;
    thenable<T = any>(): PromiseLike<T>;
    asyncIterable<T = any>(): AsyncIterable<T>;
    null(): null;
    primitive<T extends string | number | boolean | bigint | symbol | undefined>(): T;
    string(): string;
    number(): number;
    boolean(): boolean;
    bigint(): bigint;
    symbol(): symbol;
    undefined(): undefined;
    undefinedString(): string;
    function_(): (...args: any[]) => any;
    typedArray<T extends ArrayBufferView = Uint8Array>(): T;
    dataView(): DataView;
    arrayBuffer(): ArrayBuffer;
    map<K = any, V = any>(): Map<K, V>;
    set<T = any>(): Set<T>;
    date(): Date;
    regexp(): RegExp;
    error(msg?: string): Error;
    iterable<T = any>(): Iterable<T>;
    iterator<T = any>(): Iterator<T>;
    object<T extends object = object>(): T;
    plainObject<T extends object = Record<string, any>>(): T;
    array<T = any>(): T[];
    weakMap<K extends object = object, V = any>(): WeakMap<K, V>;
    weakSet<T extends object = object>(): WeakSet<T>;
    promiseInstance<T = any>(): Promise<T>;
    url(): URL;
    urlSearchParams(): URLSearchParams;
    buffer(): Buffer;
    _ArrayBuffer(): Uint8Array;
}
declare const a: CreateApparation;
export { a, a as Apparation };
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
