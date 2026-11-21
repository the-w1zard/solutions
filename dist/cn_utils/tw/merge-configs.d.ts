import type { AnyConfig, ConfigExtension } from "./types";
/**
 * @param baseConfig Config where other config will be merged into. This object will be mutated.
 * @param configExtension Partial config to merge into the `baseConfig`.
 */
export declare const mergeConfigs: <ClassGroupIds extends string, ThemeGroupIds extends string = never>(baseConfig: AnyConfig, { cacheSize, prefix, experimentalParseClassName, extend, override, }: ConfigExtension<ClassGroupIds, ThemeGroupIds>) => AnyConfig;
