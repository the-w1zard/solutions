export type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false;
type ClassNameArray = readonly ClassNameValue[];
export declare const twJoin: (...classLists: ClassNameValue[]) => string;
export {};
