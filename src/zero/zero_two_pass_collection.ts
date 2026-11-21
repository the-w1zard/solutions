import { buildCtx } from "../tricks/build_ctx";
import { makeStub } from "../tricks/stubs";
import { zeroNexusMirror } from "./zero_nexus_mirror";

export function zeroTwoPassCollection<R extends Record<string, any>>(categoryName: string, factory: (ctx: SelfType) => R) {
    const refs = zeroNexusMirror(categoryName);
    const stubProxy = new Proxy({}, { get: () => makeStub() });
    const pass1 = factory(buildCtx(refs, stubProxy));

    const collectedConstants: Record<string, any> = {};
    const collectedSpecs: Record<string, any> = {};
    for (const key in pass1) {
        if (pass1[key]?.constants) collectedConstants[key] = pass1[key].constants;
        if (pass1[key]?.specs) collectedSpecs[key] = pass1[key].specs;
    }

    const resolveProxy = new Proxy({}, {
        get: (_t, key: string) => new Proxy({}, {
            get: (_s, prop: string | symbol) => {
                if (prop === 'constants') {
                    const real = collectedConstants[key];
                    if (!real) return makeStub();
                    return new Proxy(real, { get: (t, p) => (p in t ? (t as any)[p] : makeStub()) });
                }
                if (prop === 'specs') {
                    const real = collectedSpecs[key];
                    if (!real) return makeStub();
                    return new Proxy(real, { get: (t, p) => (p in t ? (t as any)[p] : makeStub()) });
                }
                return makeStub();
            }
        })
    });

    const pass2 = factory(buildCtx(refs, resolveProxy));
    return { pass2, refs };
}
