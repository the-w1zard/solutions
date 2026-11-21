import { createClassGroupUtils } from './class-group-utils';
import { createLruCache } from './lru-cache';
import { createParseClassName } from './parse-class-name';
import { createSortModifiers } from './sort-modifiers';
export const createConfigUtils = (config) => ({
    cache: createLruCache(config.cacheSize),
    parseClassName: createParseClassName(config),
    sortModifiers: createSortModifiers(config),
    postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
    ...createClassGroupUtils(config),
});
const createPostfixLookupClassGroupIds = (config) => {
    const lookup = Object.create(null);
    const classGroupIds = config.postfixLookupClassGroups;
    if (classGroupIds) {
        for (let i = 0; i < classGroupIds.length; i++) {
            lookup[classGroupIds[i]] = true;
        }
    }
    return lookup;
};
