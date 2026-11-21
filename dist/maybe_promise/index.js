export function MaybePromise(v) {
    return v !== undefined ? v : Promise.resolve(v);
}
export function MaybeUndefined(v) {
    return v !== undefined ? v : Promise.resolve(v);
}
export function MaybeNull(v) {
    return v !== undefined ? v : Promise.resolve(v);
}
