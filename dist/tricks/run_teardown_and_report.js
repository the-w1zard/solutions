export function runTeardown(t) {
    if (t == null)
        return;
    if (typeof t === 'function')
        return void t();
    if (Array.isArray(t)) {
        for (const x of t)
            runTeardown(x);
        return;
    }
    const a = t;
    if (typeof a.unsubscribe === 'function')
        return void a.unsubscribe();
    if (typeof a[Symbol.dispose] === 'function')
        return void a[Symbol.dispose]();
}
export function reportError(e) {
    const g = globalThis;
    if (typeof g.reportError === 'function')
        return void g.reportError(e);
    queueMicrotask(() => { throw e; });
}
