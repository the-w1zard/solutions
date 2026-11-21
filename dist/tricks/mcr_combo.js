export function Maybe_Chain(v) {
    return MaybePromise(new Chain(v));
}
export function Maybe_ReChain(v) {
    return MaybePromise(new ReChain(v, `Maybe_ReChain:${_sid()}`));
}
export function MCR_Combo(v, chain) {
    if (chain === 'chain')
        return MaybePromise(new Chain(v));
    if (chain === 'rechain')
        return MaybePromise(new ReChain(v, `Maybe_ReChain:${_sid()}`));
    return MaybePromise(v);
}
