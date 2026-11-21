import { buildCtx } from "./build_ctx";
import { NexusMirror } from "./nexus_mirror";
import { makeStub } from "./stubs.js";
export function twoPassCollection(categoryName, factory) {
    const refs = NexusMirror(categoryName);
    const stubProxy = new Proxy({}, { get: () => makeStub() });
    const pass1 = factory(buildCtx(refs, stubProxy));
    const collectedConstants = {};
    const collectedSpecs = {};
    for (const key in pass1) {
        if (pass1[key]?.constants)
            collectedConstants[key] = pass1[key].constants;
        if (pass1[key]?.specs)
            collectedSpecs[key] = pass1[key].specs;
    }
    const resolveProxy = new Proxy({}, {
        get: (_t, key) => new Proxy({}, {
            get: (_s, prop) => {
                if (prop === 'constants') {
                    const real = collectedConstants[key];
                    if (!real)
                        return makeStub();
                    return new Proxy(real, { get: (t, p) => (p in t ? t[p] : makeStub()) });
                }
                if (prop === 'specs') {
                    const real = collectedSpecs[key];
                    if (!real)
                        return makeStub();
                    return new Proxy(real, { get: (t, p) => (p in t ? t[p] : makeStub()) });
                }
                return makeStub();
            }
        })
    });
    const pass2 = factory(buildCtx(refs, resolveProxy));
    return { pass2, refs };
}
