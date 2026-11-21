export function buildCtx(refs, selfProxy) {
    // const v = await maelstrom.RIFTS.get("JEDI").wait()
    let builtins = {
        self: selfProxy,
        s: null,
    };
    /**	DEFER_.run("JEDI", (JEDI) => {
     builtins = {
         self: selfProxy,
         s: JEDI,
     };
    }); */
    return new Proxy(builtins, {
        get: (target, key) => (key in target ? target[key] : refs[key]),
    });
}
export function initbuildCtx(refs, selfProxy) {
    // const v = await maelstrom.RIFTS.get("JEDI").wait()
    let builtins = {
        self: selfProxy,
    };
    return new Proxy(builtins, {
        get: (target, key) => (key in target ? target[key] : refs[key]),
    });
}
