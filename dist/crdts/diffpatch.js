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
function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
}
// split keeping whitespace as its own tokens, so reconstruction is exact
function tokenize(str) { return str.match(/\s+|[^\s]+/g) ?? []; }
function diffText(oldStr, newStr) {
    const a = tokenize(oldStr);
    const b = tokenize(newStr);
    const m = a.length, n = b.length;
    const lcs = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            lcs[i][j] = a[i - 1] === b[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
        }
    }
    const ops = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) {
            ops.push([0, a[i - 1]]);
            i--;
            j--;
        }
        else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
            ops.push([-1, a[i - 1]]);
            i--;
        }
        else {
            ops.push([1, b[j - 1]]);
            j--;
        }
    }
    while (i > 0) {
        ops.push([-1, a[--i]]);
    }
    while (j > 0) {
        ops.push([1, b[--j]]);
    }
    ops.reverse();
    // merge adjacent ops of the same type — cuts delta size significantly
    const merged = [];
    for (const op of ops) {
        const last = merged[merged.length - 1];
        if (last && last[0] === op[0])
            last[1] += op[1];
        else
            merged.push([...op]);
    }
    return merged;
}
function applyTextOps(ops) {
    let out = '';
    for (const [type, text] of ops)
        if (type !== -1)
            out += text;
    return out;
}
function reverseTextOps(ops) { return ops.map(([type, text]) => [type === 1 ? -1 : type === -1 ? 1 : 0, text]); }
export class DIFFPATCH {
    hashers = [];
    opts;
    constructor(config = {}) {
        this.opts = {
            arrayDiffThreshold: 500,
            textDiffThreshold: 60,
            textDiffMaxLength: 20_000,
            ...config,
        };
    }
    setObjectHash(pattern, fn) {
        this.hashers.unshift({ pattern, fn });
    }
    clone(value) {
        if (value === null || typeof value !== 'object')
            return value;
        if (Array.isArray(value))
            return value.map((v) => this.clone(v));
        const out = {};
        for (const k in value)
            out[k] = this.clone(value[k]);
        return out;
    }
    // -- diff ---------------------------------------------------------------
    diff(left, right, path = '') {
        if (left === right)
            return undefined;
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
    diffStringValue(left, right) {
        const combined = left.length + right.length;
        const bothLongEnough = left.length >= this.opts.textDiffThreshold || right.length >= this.opts.textDiffThreshold;
        if (!bothLongEnough || combined > this.opts.textDiffMaxLength) {
            return [left, right]; // cheap whole-value replace
        }
        const ops = diffText(left, right);
        const hasChange = ops.some((op) => op[0] !== 0);
        if (!hasChange)
            return undefined;
        // only worth it if the encoded ops are actually smaller than just storing new value
        const opsSize = JSON.stringify(ops).length;
        if (opsSize >= right.length)
            return [left, right];
        return [ops, 0, TEXT_OP];
    }
    diffObject(left, right, path) {
        const delta = {};
        const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
        let changed = false;
        for (const key of keys) {
            const hasLeft = key in left;
            const hasRight = key in right;
            const childPath = path ? `${path}.${key}` : key;
            if (!hasLeft && hasRight) {
                delta[key] = [right[key]];
                changed = true;
            }
            else if (hasLeft && !hasRight) {
                delta[key] = [left[key], 0, 0];
                changed = true;
            }
            else {
                const childDelta = this.diff(left[key], right[key], childPath);
                if (childDelta !== undefined) {
                    delta[key] = childDelta;
                    changed = true;
                }
            }
        }
        return changed ? delta : undefined;
    }
    diffArray(left, right, path) {
        if (left.length > this.opts.arrayDiffThreshold || right.length > this.opts.arrayDiffThreshold) {
            return this.diffArrayByIndex(left, right);
        }
        const hasher = this.resolveHasher(path);
        if (hasher)
            return this.diffArrayByKey(left, right, hasher);
        return this.diffArrayLCS(left, right);
    }
    resolveHasher(path) {
        const found = this.hashers.find((h) => (typeof h.pattern === 'string' ? h.pattern === path : h.pattern.test(path)));
        return found?.fn;
    }
    diffArrayByIndex(left, right) {
        const delta = { _t: 'a' };
        let changed = false;
        const maxLen = Math.max(left.length, right.length);
        for (let i = 0; i < maxLen; i++) {
            if (i >= left.length) {
                delta[`${i}`] = [right[i]];
                changed = true;
            }
            else if (i >= right.length) {
                delta[`_${i}`] = [left[i], 0, 0];
                changed = true;
            }
            else {
                const d = this.diff(left[i], right[i], '');
                if (d !== undefined) {
                    delta[`${i}`] = d;
                    changed = true;
                }
            }
        }
        return changed ? delta : undefined;
    }
    diffArrayByKey(left, right, hash) {
        const leftKeys = left.map(hash);
        const rightKeys = right.map(hash);
        const leftIndexOf = new Map(leftKeys.map((k, i) => [k, i]));
        const rightIndexOf = new Map(rightKeys.map((k, i) => [k, i]));
        const delta = { _t: 'a' };
        let changed = false;
        leftKeys.forEach((key, i) => {
            if (!rightIndexOf.has(key)) {
                delta[`_${i}`] = [left[i], 0, 0];
                changed = true;
            }
        });
        rightKeys.forEach((key, j) => {
            const i = leftIndexOf.get(key);
            if (i === undefined) {
                delta[`${j}`] = [right[j]];
                changed = true;
                return;
            }
            if (i !== j) {
                delta[`_${i}`] = ['', j, 3];
                changed = true;
            }
            const inner = this.diff(left[i], right[j], '');
            if (inner !== undefined) {
                delta[`${j}`] = inner;
                changed = true;
            }
        });
        return changed ? delta : undefined;
    }
    diffArrayLCS(left, right) {
        const m = left.length, n = right.length;
        const lcs = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                lcs[i][j] = JSON.stringify(left[i - 1]) === JSON.stringify(right[j - 1])
                    ? lcs[i - 1][j - 1] + 1
                    : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
        const delta = { _t: 'a' };
        let changed = false;
        let i = m, j = n;
        const removed = [];
        const added = [];
        while (i > 0 && j > 0) {
            if (JSON.stringify(left[i - 1]) === JSON.stringify(right[j - 1])) {
                i--;
                j--;
            }
            else if (lcs[i - 1][j] >= lcs[i][j - 1]) {
                removed.push(i - 1);
                i--;
            }
            else {
                added.push(j - 1);
                j--;
            }
        }
        while (i > 0) {
            removed.push(--i);
        }
        while (j > 0) {
            added.push(--j);
        }
        removed.forEach((idx) => { delta[`_${idx}`] = [left[idx], 0, 0]; changed = true; });
        added.forEach((idx) => { delta[`${idx}`] = [right[idx]]; changed = true; });
        return changed ? delta : undefined;
    }
    // -- patch ----------------------------------------------------------------
    patch(base, delta) {
        if (delta === undefined)
            return base;
        if (isObject(delta) && delta._t === 'a') {
            return this.patchArray(base, delta);
        }
        if (Array.isArray(delta)) {
            return this.patchLeaf(base, delta);
        }
        if (isObject(delta) && isObject(base)) {
            return this.patchObject(base, delta);
        }
        return base;
    }
    patchLeaf(base, delta) {
        if (delta.length === 1)
            return delta[0]; // add
        if (delta.length === 3 && delta[1] === 0 && delta[2] === 0)
            return undefined; // delete
        if (delta.length === 3 && delta[2] === TEXT_OP)
            return applyTextOps(delta[0]); // text diff
        if (delta.length === 2)
            return delta[1]; // modify: [old, new]
        return delta[delta.length - 1];
    }
    patchObject(base, delta) {
        const out = { ...base }; // structural sharing for untouched keys
        for (const key in delta) {
            const d = delta[key];
            if (Array.isArray(d) && d.length === 3 && d[1] === 0 && d[2] === 0) {
                delete out[key];
            }
            else if (Array.isArray(d) && d.length === 1) {
                out[key] = d[0];
            }
            else if (Array.isArray(d) && d.length === 3 && d[2] === TEXT_OP) {
                out[key] = applyTextOps(d[0]);
            }
            else if (Array.isArray(d) && d.length === 2) {
                out[key] = d[1];
            }
            else {
                out[key] = this.patch(out[key], d);
            }
        }
        return out;
    }
    patchArray(base, delta) {
        const out = base.slice();
        const moves = [];
        for (const key in delta) {
            if (key === '_t')
                continue;
            if (key.startsWith('_')) {
                const idx = Number(key.slice(1));
                const d = delta[key];
                if (Array.isArray(d) && d.length === 3 && d[1] !== 0 && d[2] === 3)
                    moves.push([idx, d[1]]);
                else
                    out[idx] = DELETED;
            }
            else {
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
    reverse(delta) {
        if (delta === undefined)
            return undefined;
        if (isObject(delta) && delta._t === 'a') {
            const rev = { _t: 'a' };
            for (const key in delta) {
                if (key === '_t')
                    continue;
                const d = delta[key];
                if (key.startsWith('_')) {
                    if (Array.isArray(d) && d.length === 3 && d[1] === 0 && d[2] === 0)
                        rev[key.slice(1)] = [d[0]];
                    else
                        rev[key] = d;
                }
                else if (Array.isArray(d) && d.length === 1) {
                    rev[`_${key}`] = [d[0], 0, 0];
                }
                else {
                    rev[key] = this.reverse(d);
                }
            }
            return rev;
        }
        if (Array.isArray(delta)) {
            if (delta.length === 1)
                return [delta[0], 0, 0];
            if (delta.length === 3 && delta[1] === 0 && delta[2] === 0)
                return [delta[0]];
            if (delta.length === 3 && delta[2] === TEXT_OP)
                return [reverseTextOps(delta[0]), 0, TEXT_OP];
            if (delta.length === 2)
                return [delta[1], delta[0]];
        }
        if (isObject(delta)) {
            const rev = {};
            for (const key in delta)
                rev[key] = this.reverse(delta[key]);
            return rev;
        }
        return delta;
    }
    unpatch(patched, delta) {
        return this.patch(patched, this.reverse(delta));
    }
}
/**


 */
// #endregion
