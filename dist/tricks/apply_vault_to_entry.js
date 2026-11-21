import { mergeDeep } from "./merge_deep";
export function applyVaultToEntry(entryKey, entryConfig, vaultEntry) {
    const { source, variants: vaultVariantMap } = vaultEntry;
    if (!vaultVariantMap)
        return entryConfig;
    const mergedVariants = { ...(entryConfig.variants ?? {}) };
    for (const variantKey in vaultVariantMap) {
        const sourceKey = vaultVariantMap[variantKey][entryKey];
        if (!sourceKey)
            continue;
        const sourceGroup = source.variants?.[variantKey]?.[sourceKey];
        if (!sourceGroup)
            continue;
        mergedVariants[variantKey] = mergeDeep(sourceGroup, mergedVariants[variantKey] ?? {});
    }
    return { ...entryConfig, variants: mergedVariants };
}
