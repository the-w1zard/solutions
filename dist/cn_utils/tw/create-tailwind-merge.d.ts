import { type ClassNameValue } from './tw-join';
import type { AnyConfig } from './types';
type CreateConfigFirst = () => AnyConfig;
type CreateConfigSubsequent = (config: AnyConfig) => AnyConfig;
type TailwindMerge = (...classLists: ClassNameValue[]) => string;
export declare const createTailwindMerge: (createConfigFirst: CreateConfigFirst, ...createConfigRest: CreateConfigSubsequent[]) => TailwindMerge;
export {};
