import type { AnyClassGroupIds, AnyConfig, AnyThemeGroupIds, ClassValidator, Config } from './types';
export interface ClassPartObject {
    nextPart: Map<string, ClassPartObject>;
    validators: ClassValidatorObject[] | null;
    classGroupId: AnyClassGroupIds | undefined;
}
interface ClassValidatorObject {
    classGroupId: AnyClassGroupIds;
    validator: ClassValidator;
}
export declare const createClassGroupUtils: (config: AnyConfig) => {
    getClassGroupId: (className: string) => string;
    getConflictingClassGroupIds: (classGroupId: AnyClassGroupIds, hasPostfixModifier: boolean) => readonly AnyClassGroupIds[];
};
/**
 * Exported for testing only
 */
export declare const createClassMap: (config: Config<AnyClassGroupIds, AnyThemeGroupIds>) => ClassPartObject;
export {};
