import { cx } from "../cn_utils/cx";
export function buildVariantGroup(group) {
    const result = { ...group };
    result.extend = (overrides) => {
        const merged = { ...group };
        for (const k in overrides)
            merged[k] = cx(group[k], overrides[k]);
        return merged;
    };
    return result;
}
export function buildExposedVariants(variants) {
    if (!variants)
        return {};
    const exposed = {};
    for (const key in variants)
        exposed[key] = buildVariantGroup(variants[key]);
    return exposed;
}
export function buildVariantGroupProxy(group) {
    const baseGroup = buildVariantGroup(group);
    return new Proxy(baseGroup, {
        get: (target, key) => {
            if (key === 'extend')
                return target.extend;
            if (key in target)
                return target[key];
            return "";
        }
    });
}
export function buildExposedVariantsProxy(variants) {
    if (!variants)
        return {};
    return new Proxy({}, {
        get: (_t, groupKey) => {
            return buildVariantGroupProxy(variants[groupKey] ?? {});
        }
    });
}
