//export type Uppercas<S extends string>  intrinsic  = // compiler intrinsic                                          🡪 'a' → 'A'
class Aaa {
    self() { return this; }
}
class BB extends Aaa {
} // polymorphic this                                                       🡪 subclass-preserving return
new BB().self(); //                                                                                🡪 typed as B, not A
function MaybePromise(v) {
    return v !== undefined ? v : Promise.resolve(v); //                                                                             ... UNDEFINED 
} //                                                   ... await UNDEFINED
//   ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
//                                                MAYBE PROMISE, BUT ONLY WHEN VALUE DOES NOT EQ...
// #region ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export class CreateApparation {
    f(x) { }
    ff(arr, fallback) { }
    config = { a: 1, b: 'x' };
    assert(x) { }
    fff(Ctor) { }
    ffff(...args) { }
    // ══════════════════════════════════════════════════════════════════════════════════════════════════════════
    // #endregion
    any() { return {}; } //                                                        ... Creates a no-op for ANY type
    anyGeneric() { return {}; }
    anyProp(v) { return v; }
    anyProp2(v) { return v; }
    anyProp3(v) { return v; }
    anyAs(v) { return v; }
    promise() { return Promise.resolve({}); } //                          ... Creates a no-op Promise
    booleanPromise() { return Promise.resolve(false); } //                  ... Creates a no-op boolean Promise
    void() { } //                                                                       ... Creates a no-op void function 
    func() { return () => ({}); } //                                         ... Creates a no-op function that returns T
    funcVoid() { return () => { }; } //                                           ... Creates a no-op function that returns void
    universal() {
        return new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'symbol') {
                    return undefined;
                }
                const propName = prop;
                if (propName === 'then' || propName === 'catch' || propName === 'finally') {
                    return undefined;
                }
                if (propName === Symbol.iterator) {
                    return function* () { };
                }
                if (propName === 'toString' || propName === 'valueOf') {
                    return () => '';
                }
                return (...args) => target;
            },
            set: () => true,
            deleteProperty: () => true,
            ownKeys: () => [],
            getOwnPropertyDescriptor: () => undefined,
            apply: (target, thisArg, args) => target,
            construct: (target, args) => target
        });
    }
    universalNoop() {
        // For primitive types, return appropriate defaults
        // Using type checking at runtime
        // Check if T is a function type
        // We can't check this at runtime easily, so we'll handle it via Proxy
        // Use Proxy for maximum compatibility
        return new Proxy({}, {
            get: (target, prop) => {
                // Handle symbols
                if (typeof prop === 'symbol') {
                    return undefined;
                }
                // Handle common properties
                const propName = prop;
                // For Promise-like behavior
                if (propName === 'then' || propName === 'catch' || propName === 'finally') {
                    return undefined;
                }
                // For iteration
                if (propName === Symbol.iterator) {
                    return function* () { };
                }
                // For toString
                if (propName === 'toString' || propName === 'valueOf') {
                    return () => '';
                }
                // For any other property, return a no-op function that returns the proxy
                // This allows chaining
                return (...args) => target;
            },
            set: () => true, // Silently ignore sets
            deleteProperty: () => true, // Silently ignore deletes
            ownKeys: () => [], // No own keys
            getOwnPropertyDescriptor: () => undefined,
            apply: (target, thisArg, args) => target, // For function calls
            construct: (target, args) => target // For 'new' calls
        });
    }
    simpleNoop() { return {}; } //                                                 ... Simpler version without Proxy (fewer errors)
    noopPromise() { return Promise.resolve({}); } //                       ... For Promise specifically
    noopBooleanPromise() { return Promise.resolve(false); } //              ... For boolean Promise
    noopVoid() { } //                                                                  ... For void functions
    noopFunction() { return () => ({}); } //                                 ... For functions that return anything
    thenable() {
        return { then: (_onF, _onR) => new Promise(() => { }) };
    }
    asyncIterable() {
        return { [Symbol.asyncIterator]: async function* () { await new Promise(() => { }); } };
    }
    null() { return null; } //                                                          ... null
    primitive() {
        return undefined;
    }
    string() { return ''; } //                                                        ... string
    number() { return 0; } //                                                         ... number
    boolean() { return false; } //                                                   ... boolean
    bigint() { return 0n; } //                                                        ... bigint
    symbol() { return Symbol('apparation'); } //                                      ... symbol
    undefined() { return undefined; } //                                           ... undefined
    undefinedString() { return 'undefined'; } //                                      ... undefined string
    function_() { return () => { }; } //                             ... function
    typedArray() {
        return new Uint8Array();
    }
    dataView() { return new DataView(new ArrayBuffer(0)); } //                      ... data view
    arrayBuffer() { return new ArrayBuffer(0); } //                              ... array buffer
    map() { return new Map(); } //                         ... map
    set() { return new Set(); } //                                        ... set
    date() { return new Date(0); } //                                                   ... date
    regexp() { return /(?:)/; } //                                                    ... regexp
    error(msg = '[Apparation]') { return new Error(msg); } //                          ... error
    iterable() { return []; } //                                 ... iterable 
    iterator() { return [][Symbol.iterator](); } //                     ... iterator
    object() { return {}; } //                             ... object 
    plainObject() { return {}; } //           ... plainObject
    array() { return []; } //                                            ... Array
    weakMap() {
        return new WeakMap();
    }
    weakSet() { return new WeakSet(); } //          ... WeakSet
    promiseInstance() { return Promise.resolve({}); } //            ... Promise
    url() { return new URL('about:blank'); } //                                          ... URL
    urlSearchParams() { return new URLSearchParams(); } //                   ... URLSearchParams
    buffer() { return Buffer.alloc(0); } //                                            ... Buffer
    _ArrayBuffer() { return new Uint8Array(); } //                                 ... ArrayBuffer
}
const a = new CreateApparation;
export { a, a as Apparation };
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
