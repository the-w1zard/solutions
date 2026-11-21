// #region ── TYPEO GUARD ────────────────────────────────────────────────────────────────── 
export function withTypoGuard<T extends Record<string, any>>(result: T, location: any, label: string, allowedExtraKeys: string[] = ['freyr']): T {
    return new Proxy(result, {
        get(target, prop, receiver) {
            if (typeof prop === 'symbol' || prop in target || allowedExtraKeys.includes(prop as string)) {
                return Reflect.get(target, prop, receiver);
            }

            const validKeys = Object.keys(target).join(', ');

            throw new Error(
                `\n\x1b[31m[${label} Typo Error]\x1b[0m Property \x1b[33m"${String(prop)}"\x1b[0m does not exist on this ${label} definition.\n` +
                `  -> \x1b[32mDid you make a spelling mistake?\x1b[0m\n` +
                `  -> \x1b[35mAvailable definitions:\x1b[0m [ ${validKeys} ]\n` +
                `  -> \x1b[36mDefined at:\x1b[0m ${location}\n`
            );
        }
    });
}
// #endregion
