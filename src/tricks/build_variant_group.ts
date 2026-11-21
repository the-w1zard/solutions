import { cx } from "../cn_utils/cx"

 


export function buildVariantGroup(group: Record<string, ClassInput>): variant_group {
  const result = { ...group } as variant_group
  result.extend = (overrides: Record<string, ClassInput>): Record<string, ClassInput> => {
    const merged: Record<string, ClassInput> = { ...group }
    for (const k in overrides) merged[k] = cx(group[k], overrides[k])
    return merged
  }
  return result
}

export function buildExposedVariants(variants: AnyVariantSchema | undefined): ExposedVariants {
  if (!variants) return {}
  const exposed: ExposedVariants = {}
  for (const key in variants) exposed[key] = buildVariantGroup((variants as any)[key])
  return exposed
}
export function buildVariantGroupProxy(group: any) {
  const baseGroup = buildVariantGroup(group);
  return new Proxy(baseGroup, {
    get: (target, key: string) => {
      if (key === 'extend') return target.extend;
      if (key in target) return target[key];
      return "";
    }
  });
}
export function buildExposedVariantsProxy(variants: any) {
  if (!variants) return {};
  return new Proxy({}, {
    get: (_t, groupKey: string) => {
      return buildVariantGroupProxy(variants[groupKey] ?? {});
    }
  });
}



