export function resolveFactory(raw) {
    if (typeof raw === 'function')
        return raw;
    return () => raw;
}
export function resolveVaultFactory(raw) {
    if (typeof raw === 'function')
        return raw;
    return () => raw;
}
export function resolveAnyFactory(raw) {
    if (typeof raw === 'function')
        return raw;
    return () => raw;
}
