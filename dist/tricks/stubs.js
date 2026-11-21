export const STUB_HITS = [];
const NINJA_STUB_BRAND = '__is_ninja_stub__';
export function isStub(value) {
    try {
        return !!value && (typeof value === 'object' || typeof value === 'function') && value[NINJA_STUB_BRAND] === true;
    }
    catch {
        return false;
    }
}
export function makeStub(trace) {
    return new Proxy(() => makeStub(trace), {
        get: (_t, prop) => {
            if (prop === NINJA_STUB_BRAND)
                return true;
            if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf')
                return () => '';
            if (trace && typeof prop === 'string') {
                STUB_HITS.push({ ...trace, prop });
            }
            return makeStub(trace);
        },
        apply: () => { if (trace)
            STUB_HITS.push({ ...trace, prop: '()' }); return makeStub(trace); },
    });
}
export function flushStubReport() {
    if (!STUB_HITS.length)
        return;
    console.table(STUB_HITS);
    STUB_HITS.length = 0;
}
// #endregion
