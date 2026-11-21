/**import { useSXX } from "./ssx";

export const DALARAN_REGISTRY: Record<string, A[]> = {}

const cap = 200

export function ArcaneRegistry<T = A>(name: string, result: A) {
	const [s, setS] = useSXX<Boolean>(false); //useState(false)
	const THE_CLOUD_SL_REG = (globalThis as A).THE_CLOUD_SL_REG;
	const SIGNALS_SL_REG = (globalThis as A).SIGNALS_SL_REG;
	const HADRON_COLLIDER_SL_REG = (globalThis as A).HADRON_COLLIDER_SL_REG;
	function set_bare_state(p: A, k: A, s = THE_CLOUD_SL_REG, m = SIGNALS_SL_REG, r = HADRON_COLLIDER_SL_REG, tr: B = true) {
		const _state = getNestedMap<A, A>(s, m, r);
		const _persistent = getNestedMap<A, A>(`${s}_PERSISTENT`, m, r);
		const _persistKeys = getNestedMap<A, boolean>(`${s}_PERSIST_KEYS`, m, k);
		const _listeners = getNestedMap<A, Set<(value: A) => void>>(`${s}_LISTENERS`, m, k);
		const prev = _state.get(k);
		const next = typeof p === "function" ? (p as (prev: T | undefined) => T)(prev) : p;
		if (Object.is(prev, next)) return;
		// TIME TRAVEL
		/**if (DRSTime) {
    

if (!this.j.root.DRSTime._time_travel_reverting) {
    const meta = getMetadata(s, m, r);
    let hist = meta._history.get(k);
    if (!hist) {
        hist = [];
        meta._history.set(k, hist);
    }
    const lastActive = hist.findLastIndex((e: HistoryEntry) => !e.undone) ?? -1;
    if (lastActive < hist.length - 1) hist.length = lastActive + 1; // truncate redo tail
    hist.push({ k: (hist[hist.length - 1]?.k ?? 0) + 1, prev, next, ts: Date.now(), undone: false });
    const cap_val = cap ?? 200;
    while (hist.length > cap_val) hist.shift();
}
} * /
		const triggerRender = tr;
		_state.set(k, next);
		if (_persistKeys.has(k)) _persistent.set(k, next);
		// if (triggerRender) scheduleNotify(k, _listeners, _state);
		return MaybePromise(next as T);
	}
	set_bare_state(name, result);

	if (s === false) {
		for (const [key, values] of Object.entries(DALARAN_REGISTRY)) {
			const existing = getSauron(key);
			if (existing !== undefined) continue;
			for (const value of values) {
				setSauron(key, value, false);
			}
		}
		setS(true);
	}
}
 */
