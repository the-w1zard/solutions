


// #region ███████████████ DIFFPATCH ███████████████████████████████████████████████████
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
// ============================================================================
// DIFFPATCH — structural diff/patch with structural sharing, lazy reversal,
// per-path array identity matching, and real word-level text diffing


// ============================================================================
const DELETED = Symbol('deleted');
const TEXT_OP = 2; // delta shape: [ops, 0, TEXT_OP]
function isObject(v: any): v is Record<string, any> {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}
// -- word-level text diff (LCS over tokens, not characters — O(n*m) on token count, not char count) --
type TextOp = [0 | 1 | -1, string]; // 0 = equal, 1 = insert, -1 = delete
// split keeping whitespace as its own tokens, so reconstruction is exact
function tokenize(str: string): string[] { return str.match(/\s+|[^\s]+/g) ?? []; }
function diffText(oldStr: string, newStr: string): TextOp[] {
    const a = tokenize(oldStr);
    const b = tokenize(newStr);
    const m = a.length, n = b.length;
    const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            lcs[i][j] = a[i - 1] === b[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
    }

    const ops: TextOp[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) { ops.push([0, a[i - 1]]); i--; j--; }
        else if (lcs[i - 1][j] >= lcs[i][j - 1]) { ops.push([-1, a[i - 1]]); i--; }
        else { ops.push([1, b[j - 1]]); j--; }
    }
    while (i > 0) { ops.push([-1, a[--i]]); }
    while (j > 0) { ops.push([1, b[--j]]); }

    ops.reverse();

    // merge adjacent ops of the same type — cuts delta size significantly
    const merged: TextOp[] = [];
    for (const op of ops) {
        const last = merged[merged.length - 1];
        if (last && last[0] === op[0]) last[1] += op[1];
        else merged.push([...op]);
    }
    return merged;
}
function applyTextOps(ops: TextOp[]): string {
    let out = '';
    for (const [type, text] of ops) if (type !== -1) out += text;
    return out;
}
function reverseTextOps(ops: TextOp[]): TextOp[] { return ops.map(([type, text]) => [type === 1 ? -1 : type === -1 ? 1 : 0, text] as TextOp); }

export class DIFFPATCH {
    private hashers: Array<{ pattern: string | RegExp; fn: (item: any, index: number) => string }> = [];
    private opts: Required<DiffPatchConfig>;

    constructor(config: DiffPatchConfig = {}) {
        this.opts = {
            arrayDiffThreshold: 500,
            textDiffThreshold: 60,
            textDiffMaxLength: 20_000,
            ...config,
        };
    }

    public setObjectHash(pattern: string | RegExp, fn: (item: any, index: number) => string): void {
        this.hashers.unshift({ pattern, fn });
    }

    public clone<T>(value: T): T {
        if (value === null || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map((v) => this.clone(v)) as any;
        const out: any = {};
        for (const k in value as any) out[k] = this.clone((value as any)[k]);
        return out;
    }

    // -- diff ---------------------------------------------------------------

    public diff(left: any, right: any, path = ''): Delta | undefined {
        if (left === right) return undefined;

        if (typeof left === 'string' && typeof right === 'string') {
            return this.diffStringValue(left, right);
        }

        if (Array.isArray(left) && Array.isArray(right)) {
            return this.diffArray(left, right, path);
        }

        if (isObject(left) && isObject(right)) {
            return this.diffObject(left, right, path);
        }

        return [left, right]; // primitive/type-change modify: [oldVal, newVal]
    }

    private diffStringValue(left: string, right: string): Delta | undefined {
        const combined = left.length + right.length;
        const bothLongEnough = left.length >= this.opts.textDiffThreshold || right.length >= this.opts.textDiffThreshold;

        if (!bothLongEnough || combined > this.opts.textDiffMaxLength) {
            return [left, right]; // cheap whole-value replace
        }

        const ops = diffText(left, right);
        const hasChange = ops.some((op) => op[0] !== 0);
        if (!hasChange) return undefined;

        // only worth it if the encoded ops are actually smaller than just storing new value
        const opsSize = JSON.stringify(ops).length;
        if (opsSize >= right.length) return [left, right];

        return [ops, 0, TEXT_OP];
    }

    private diffObject(left: Record<string, any>, right: Record<string, any>, path: string): Delta | undefined {
        const delta: Record<string, any> = {};
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
        let changed = false;

        for (const key of keys) {
            const hasLeft = key in left;
            const hasRight = key in right;
            const childPath = path ? `${path}.${key}` : key;

            if (!hasLeft && hasRight) {
                delta[key] = [right[key]];
                changed = true;
            } else if (hasLeft && !hasRight) {
                delta[key] = [left[key], 0, 0];
                changed = true;
            } else {
                const childDelta = this.diff(left[key], right[key], childPath);
                if (childDelta !== undefined) {
                    delta[key] = childDelta;
                    changed = true;
                }
            }
        }

        return changed ? delta : undefined;
    }

    private diffArray(left: any[], right: any[], path: string): Delta | undefined {
        if (left.length > this.opts.arrayDiffThreshold || right.length > this.opts.arrayDiffThreshold) {
            return this.diffArrayByIndex(left, right);
        }
        const hasher = this.resolveHasher(path);
        if (hasher) return this.diffArrayByKey(left, right, hasher);
        return this.diffArrayLCS(left, right);
    }

    private resolveHasher(path: string) {
        const found = this.hashers.find((h) => (typeof h.pattern === 'string' ? h.pattern === path : h.pattern.test(path)));
        return found?.fn;
    }

    private diffArrayByIndex(left: any[], right: any[]): Delta | undefined {
        const delta: Record<string, any> = { _t: 'a' };
        let changed = false;
        const maxLen = Math.max(left.length, right.length);
        for (let i = 0; i < maxLen; i++) {
            if (i >= left.length) { delta[`${i}`] = [right[i]]; changed = true; }
            else if (i >= right.length) { delta[`_${i}`] = [left[i], 0, 0]; changed = true; }
            else {
                const d = this.diff(left[i], right[i], '');
                if (d !== undefined) { delta[`${i}`] = d; changed = true; }
            }
        }
        return changed ? delta : undefined;
    }

    private diffArrayByKey(left: any[], right: any[], hash: (item: any, i: number) => string): Delta | undefined {
        const leftKeys = left.map(hash);
        const rightKeys = right.map(hash);
        const leftIndexOf = new Map(leftKeys.map((k, i) => [k, i]));
        const rightIndexOf = new Map(rightKeys.map((k, i) => [k, i]));

        const delta: Record<string, any> = { _t: 'a' };
        let changed = false;

        leftKeys.forEach((key, i) => {
            if (!rightIndexOf.has(key)) { delta[`_${i}`] = [left[i], 0, 0]; changed = true; }
        });

        rightKeys.forEach((key, j) => {
            const i = leftIndexOf.get(key);
            if (i === undefined) { delta[`${j}`] = [right[j]]; changed = true; return; }
            if (i !== j) { delta[`_${i}`] = ['', j, 3]; changed = true; }
            const inner = this.diff(left[i], right[j], '');
            if (inner !== undefined) { delta[`${j}`] = inner; changed = true; }
        });

        return changed ? delta : undefined;
    }

    private diffArrayLCS(left: any[], right: any[]): Delta | undefined {
        const m = left.length, n = right.length;
        const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                lcs[i][j] = JSON.stringify(left[i - 1]) === JSON.stringify(right[j - 1])
                    ? lcs[i - 1][j - 1] + 1
                    : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }

        const delta: Record<string, any> = { _t: 'a' };
        let changed = false;
        let i = m, j = n;
        const removed: number[] = [];
        const added: number[] = [];

        while (i > 0 && j > 0) {
            if (JSON.stringify(left[i - 1]) === JSON.stringify(right[j - 1])) { i--; j--; }
            else if (lcs[i - 1][j] >= lcs[i][j - 1]) { removed.push(i - 1); i--; }
            else { added.push(j - 1); j--; }
        }
        while (i > 0) { removed.push(--i); }
        while (j > 0) { added.push(--j); }

        removed.forEach((idx) => { delta[`_${idx}`] = [left[idx], 0, 0]; changed = true; });
        added.forEach((idx) => { delta[`${idx}`] = [right[idx]]; changed = true; });

        return changed ? delta : undefined;
    }

    // -- patch ----------------------------------------------------------------

    public patch<T = any>(base: T, delta: Delta): T {
        if (delta === undefined) return base;

        if (isObject(delta) && delta._t === 'a') {
            return this.patchArray(base as any, delta) as any;
        }
        if (Array.isArray(delta)) {
            return this.patchLeaf(base, delta);
        }
        if (isObject(delta) && isObject(base)) {
            return this.patchObject(base, delta) as any;
        }
        return base;
    }

    private patchLeaf(base: any, delta: any[]): any {
        if (delta.length === 1) return delta[0];                                            // add
        if (delta.length === 3 && delta[1] === 0 && delta[2] === 0) return undefined;        // delete
        if (delta.length === 3 && delta[2] === TEXT_OP) return applyTextOps(delta[0]);       // text diff
        if (delta.length === 2) return delta[1];                                             // modify: [old, new]
        return delta[delta.length - 1];
    }

    private patchObject(base: Record<string, any>, delta: Record<string, any>): Record<string, any> {
        const out = { ...base }; // structural sharing for untouched keys
        for (const key in delta) {
            const d = delta[key];
            if (Array.isArray(d) && d.length === 3 && d[1] === 0 && d[2] === 0) {
                delete out[key];
            } else if (Array.isArray(d) && d.length === 1) {
                out[key] = d[0];
            } else if (Array.isArray(d) && d.length === 3 && d[2] === TEXT_OP) {
                out[key] = applyTextOps(d[0]);
            } else if (Array.isArray(d) && d.length === 2) {
                out[key] = d[1];
            } else {
                out[key] = this.patch(out[key], d);
            }
        }
        return out;
    }

    private patchArray(base: any[], delta: Record<string, any>): any[] {
        const out = base.slice();
        const moves: Array<[number, number]> = [];

        for (const key in delta) {
            if (key === '_t') continue;
            if (key.startsWith('_')) {
                const idx = Number(key.slice(1));
                const d = delta[key];
                if (Array.isArray(d) && d.length === 3 && d[1] !== 0 && d[2] === 3) moves.push([idx, d[1]]);
                else out[idx] = DELETED;
            } else {
                const idx = Number(key);
                const d = delta[key];
                out[idx] = Array.isArray(d) && d.length === 1 ? d[0] : this.patch(out[idx], d);
            }
        }

        let result = out.filter((v) => v !== DELETED);

        if (moves.length) {
            const withMoves = base.slice();
            moves.forEach(([from, to]) => { withMoves[to] = base[from]; });
            result = withMoves;
        }

        return result;
    }

    // -- reverse / unpatch ------------------------------------------------------

    public reverse(delta: Delta): Delta {
        if (delta === undefined) return undefined;

        if (isObject(delta) && delta._t === 'a') {
            const rev: Record<string, any> = { _t: 'a' };
            for (const key in delta) {
                if (key === '_t') continue;
                const d = delta[key];
                if (key.startsWith('_')) {
                    if (Array.isArray(d) && d.length === 3 && d[1] === 0 && d[2] === 0) rev[key.slice(1)] = [d[0]];
                    else rev[key] = d;
                } else if (Array.isArray(d) && d.length === 1) {
                    rev[`_${key}`] = [d[0], 0, 0];
                } else {
                    rev[key] = this.reverse(d);
                }
            }
            return rev;
        }

        if (Array.isArray(delta)) {
            if (delta.length === 1) return [delta[0], 0, 0];
            if (delta.length === 3 && delta[1] === 0 && delta[2] === 0) return [delta[0]];
            if (delta.length === 3 && delta[2] === TEXT_OP) return [reverseTextOps(delta[0]), 0, TEXT_OP];
            if (delta.length === 2) return [delta[1], delta[0]];
        }

        if (isObject(delta)) {
            const rev: Record<string, any> = {};
            for (const key in delta) rev[key] = this.reverse(delta[key]);
            return rev;
        }

        return delta;
    }

    public unpatch<T = any>(patched: T, delta: Delta): T {
        return this.patch(patched, this.reverse(delta));
    }
}
/** 


 */
// #endregion
