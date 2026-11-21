import { mergeDeep } from "./merge_deep";



export function applyVaultToEntry(entryKey: string, entryConfig: IncantationsConfig<any, any, any, any, any, any, any, any, any, any>, vaultEntry: vault_entry): IncantationsConfig<any, any, any, any, any, any, any, any, any, any> {
  const { source, variants: vaultVariantMap } = vaultEntry
  if (!vaultVariantMap) return entryConfig
  const mergedVariants: Record<string, any> = { ...(entryConfig.variants as any ?? {}) }
  for (const variantKey in vaultVariantMap) {
    const sourceKey = vaultVariantMap[variantKey][entryKey]
    if (!sourceKey) continue
    const sourceGroup = source.variants?.[variantKey]?.[sourceKey]
    if (!sourceGroup) continue
    mergedVariants[variantKey] = mergeDeep(sourceGroup, mergedVariants[variantKey] ?? {})
  }
  return { ...entryConfig, variants: mergedVariants }
}
