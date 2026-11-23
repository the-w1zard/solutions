import type { AnyConfig, ConfigExtension, DefaultClassGroupIds, DefaultThemeGroupIds } from './types';
type CreateConfigSubsequent = (config: AnyConfig) => AnyConfig;
export declare const extendTailwindMerge: <AdditionalClassGroupIds extends string = never, AdditionalThemeGroupIds extends string = never>(configExtension: ConfigExtension<DefaultClassGroupIds | AdditionalClassGroupIds, DefaultThemeGroupIds | AdditionalThemeGroupIds> | CreateConfigSubsequent, ...createConfig: CreateConfigSubsequent[]) => (...classLists: import("./tw-join").ClassNameValue[]) => string;
export {};
