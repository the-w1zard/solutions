import { createConfigUtils } from './config-utils';
import { mergeClassList } from './merge-classlist';
import { twJoin } from './tw-join';
export const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
    let configUtils;
    let cacheGet;
    let cacheSet;
    let functionToCall;
    const initTailwindMerge = (classList) => {
        const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
        configUtils = createConfigUtils(config);
        cacheGet = configUtils.cache.get;
        cacheSet = configUtils.cache.set;
        functionToCall = tailwindMerge;
        return tailwindMerge(classList);
    };
    const tailwindMerge = (classList) => {
        const cachedResult = cacheGet(classList);
        if (cachedResult) {
            return cachedResult;
        }
        const result = mergeClassList(classList, configUtils);
        cacheSet(classList, result);
        return result;
    };
    functionToCall = initTailwindMerge;
    return (...args) => functionToCall(twJoin(...args));
};
