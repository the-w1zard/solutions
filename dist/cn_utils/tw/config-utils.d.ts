import type { AnyClassGroupIds, AnyConfig } from './types';
export type ConfigUtils = ReturnType<typeof createConfigUtils>;
export declare const createConfigUtils: (config: AnyConfig) => {
    getClassGroupId: (className: string) => string;
    getConflictingClassGroupIds: (classGroupId: AnyClassGroupIds, hasPostfixModifier: boolean) => readonly AnyClassGroupIds[];
    cache: import("./lru-cache").LruCache<string, string>;
    parseClassName: (className: string) => import("./types").ParsedClassName;
    sortModifiers: (modifiers: readonly string[]) => string[];
    postfixLookupClassGroupIds: Partial<Record<string, true>>;
};
