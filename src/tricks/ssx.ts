export function resetEffectIndex() {
    effectIndex = 0;
}
export function useSXX<T = A, F = A>(initialValue: any) {
    let state = initialValue;
    const listeners = new Set();

    const getState = () => state;

    const setState = (newValue: any) => {
        const nextValue =
            typeof newValue === 'function' ? newValue(state) : newValue;

        if (Object.is(state, nextValue)) return;

        state = nextValue;
        listeners.forEach((listener: any) => listener(state));
    };

    const subscribe = (listener: any) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return [getState as T, setState as F, subscribe];
}
let effectIndex = 0;
const effectStore: any = [];

export function useEFFEX(effect: any, deps: any) {
    const i = effectIndex++;
    const prev = effectStore[i];

    const hasDeps = Array.isArray(deps);
    const changed =
        !hasDeps ||
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
