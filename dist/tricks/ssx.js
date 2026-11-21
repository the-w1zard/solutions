export function resetEffectIndex() {
    effectIndex = 0;
}
export function useSXX(initialValue) {
    let state = initialValue;
    const listeners = new Set();
    const getState = () => state;
    const setState = (newValue) => {
        const nextValue = typeof newValue === 'function' ? newValue(state) : newValue;
        if (Object.is(state, nextValue))
            return;
        state = nextValue;
        listeners.forEach((listener) => listener(state));
    };
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };
    return [getState, setState, subscribe];
}
let effectIndex = 0;
const effectStore = [];
export function useEFFEX(effect, deps) {
    const i = effectIndex++;
    const prev = effectStore[i];
    const hasDeps = Array.isArray(deps);
    const changed = !hasDeps ||
        !prev ||
        !prev.deps ||
        deps.length !== prev.deps.length ||
        deps.some((dep, j) => !Object.is(dep, prev.deps[j]));
    if (changed) {
        // cleanup previous
        if (prev && typeof prev.cleanup === 'function') {
            prev.cleanup();
        }
        const cleanup = effect();
        effectStore[i] = {
            deps: hasDeps ? deps : null,
            cleanup: typeof cleanup === 'function' ? cleanup : null,
        };
    }
}
