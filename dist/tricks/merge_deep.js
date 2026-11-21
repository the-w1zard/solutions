export function mergeDeep(a, b) {
    const result = { ...a };
    for (const key in b) {
        if (typeof b[key] === 'object' && b[key] !== null && !Array.isArray(b[key]) && typeof a[key] === 'object' && a[key] !== null && !Array.isArray(a[key])) {
            result[key] = mergeDeep(a[key], b[key]);
        }
        else {
            result[key] = b[key];
        }
    }
    return result;
}
