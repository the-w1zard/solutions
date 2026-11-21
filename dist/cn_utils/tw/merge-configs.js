/**
 * @param baseConfig Config where other config will be merged into. This object will be mutated.
 * @param configExtension Partial config to merge into the `baseConfig`.
 */
export const mergeConfigs = (baseConfig, { cacheSize, prefix, experimentalParseClassName, extend = {}, override = {}, }) => {
    overrideProperty(baseConfig, 'cacheSize', cacheSize);
    overrideProperty(baseConfig, 'prefix', prefix);
    overrideProperty(baseConfig, 'experimentalParseClassName', experimentalParseClassName);
    overrideConfigProperties(baseConfig.theme, override.theme);
    overrideConfigProperties(baseConfig.classGroups, override.classGroups);
    overrideConfigProperties(baseConfig.conflictingClassGroups, override.conflictingClassGroups);
    overrideConfigProperties(baseConfig.conflictingClassGroupModifiers, override.conflictingClassGroupModifiers);
    overrideProperty(baseConfig, 'postfixLookupClassGroups', override.postfixLookupClassGroups);
    overrideProperty(baseConfig, 'orderSensitiveModifiers', override.orderSensitiveModifiers);
    mergeConfigProperties(baseConfig.theme, extend.theme);
    mergeConfigProperties(baseConfig.classGroups, extend.classGroups);
    mergeConfigProperties(baseConfig.conflictingClassGroups, extend.conflictingClassGroups);
    mergeConfigProperties(baseConfig.conflictingClassGroupModifiers, extend.conflictingClassGroupModifiers);
    mergeArrayProperties(baseConfig, extend, 'postfixLookupClassGroups');
    mergeArrayProperties(baseConfig, extend, 'orderSensitiveModifiers');
    return baseConfig;
};
const overrideProperty = (baseObject, overrideKey, overrideValue) => {
    if (overrideValue !== undefined) {
        baseObject[overrideKey] = overrideValue;
    }
};
const overrideConfigProperties = (baseObject, overrideObject) => {
    if (overrideObject) {
        for (const key in overrideObject) {
            overrideProperty(baseObject, key, overrideObject[key]);
        }
    }
};
const mergeConfigProperties = (baseObject, mergeObject) => {
    if (mergeObject) {
        for (const key in mergeObject) {
            mergeArrayProperties(baseObject, mergeObject, key);
        }
    }
};
const mergeArrayProperties = (baseObject, mergeObject, key) => {
    const mergeValue = mergeObject[key];
    if (mergeValue !== undefined) {
        baseObject[key] = baseObject[key] ? baseObject[key].concat(mergeValue) : mergeValue;
    }
};
