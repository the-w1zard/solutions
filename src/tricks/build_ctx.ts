export function buildCtx(refs: A, selfProxy: A): SelfType {
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
		get: (target, key: string) => (key in target ? (target as A)[key] : (refs as A)[key]),
	});
}
export function initbuildCtx(refs: A, selfProxy: A): SelfType {
	// const v = await maelstrom.RIFTS.get("JEDI").wait()
	let builtins = {
		self: selfProxy,
	};
	return new Proxy(builtins, {
		get: (target, key: string) => (key in target ? (target as A)[key] : (refs as A)[key]),
	});
}
