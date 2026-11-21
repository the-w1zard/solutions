export declare const MEMO_CAP = 500;
export declare const memo: Map<string, string>;
export declare function memoize(key: string, compute: () => string): string;
