// #region ── makeStub ────────────────────────────────────────────────────────────────── 
type StubHit = { category: string; key: string; prop: string; location: any };
export const STUB_HITS: StubHit[] = [];

const NINJA_STUB_BRAND = '__is_ninja_stub__';

export function isStub(value: any): boolean {
    try { return !!value && (typeof value === 'object' || typeof value === 'function') && value[NINJA_STUB_BRAND] === true; }
    catch { return false; }
}

export function makeStub(trace?: { category: string; key: string; location: any }): any {
    return new Proxy(() => makeStub(trace), {
        get: (_t, prop: string | symbol) => {
            if (prop === NINJA_STUB_BRAND) return true;
            if (prop === Symbol.toPrimitive || prop === 'toString' || prop === 'valueOf') return () => '';
            if (trace && typeof prop === 'string') {
                STUB_HITS.push({ ...trace, prop });
            }
            return makeStub(trace);
        },
        apply: () => { if (trace) STUB_HITS.push({ ...trace, prop: '()' }); return makeStub(trace); },
    });
}

export function flushStubReport() {
    if (!STUB_HITS.length) return;
    console.table(STUB_HITS);
    STUB_HITS.length = 0;
}

// #endregion
