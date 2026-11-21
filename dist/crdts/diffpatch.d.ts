/**
 *

.diff<T>(left: T, right: T): Delta | undefined
.patch<T>(base: T, delta: Delta): T          // structural sharing — untouched subtrees are the same reference
.unpatch<T>(patched: T, delta: Delta): T     // reverse the delta back to the original
.reverse(delta: Delta): Delta

.setObjectHash(pathPattern: string | RegExp, fn: (item: any, index: number) => string): void
.clone<T>(value: T): T


const dp = new DIFFPATCH();

dp.setObjectHash(/^tasks$/, (item) => item.id);

const before = { name: 'Sprint 1', tasks: [{ id: 'a', done: false }, { id: 'b', done: false }] };
const after  = { name: 'Sprint 1', tasks: [{ id: 'a', done: true }, { id: 'b', done: false }, { id: 'c', done: false }] };

const delta = dp.diff(before, after);
// send `delta` over ws/longpoll instead of the whole object

const reconstructed = dp.patch(before, delta);   // === after, structurally
const rolledBack = dp.unpatch(reconstructed, delta); // === before
 */
export declare class DIFFPATCH {
    private hashers;
    private opts;
    constructor(config?: DiffPatchConfig);
    setObjectHash(pattern: string | RegExp, fn: (item: any, index: number) => string): void;
    clone<T>(value: T): T;
    diff(left: any, right: any, path?: string): Delta | undefined;
    private diffStringValue;
    private diffObject;
    private diffArray;
    private resolveHasher;
    private diffArrayByIndex;
    private diffArrayByKey;
    private diffArrayLCS;
    patch<T = any>(base: T, delta: Delta): T;
    private patchLeaf;
    private patchObject;
    private patchArray;
    reverse(delta: Delta): Delta;
    unpatch<T = any>(patched: T, delta: Delta): T;
}
/**


 */
