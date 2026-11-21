/**
 *
 */
export declare const c: {
    emerald: {
        10: string;
        9: string;
        8: string;
        7: string;
        6: string;
        5: string;
    };
    blue: {
        10: string;
        9: string;
        8: string;
        7: string;
        6: string;
        5: string;
    };
};
export declare const t: {
    deep: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
    vintage: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
    error: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
    warn: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
    success: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
    info: {
        bg: string;
        txt: string;
        size: number;
        title_size: number;
        title_txt: string;
        payload_key: string;
        payload_value: string;
        font: string;
        border: string;
        borderRadius: string;
        padding: string;
        svg: string;
    };
};
export declare function log(msg: string | string[], p?: any, theme?: {
    bg: string;
    txt: string;
    size: number;
    title_size: number;
    title_txt: string;
    payload_key: string;
    payload_value: string;
    font: string;
    border: string;
    borderRadius: string;
    padding: string;
    svg: string;
}): void;
export type MaybeUndefined<R = any> = R;
export declare function MaybeUndefined<R = any>(v: R): MaybePromise;
export type MaybeNull<R = any> = R;
export declare function MaybeNull<R = any>(v: R): MaybePromise;
export type MaybeDeferred<T> = T extends undefined ? Promise<undefined> : T;
export declare function MaybeDeferred<T>(value: T): MaybeDeferred<T>;
export type ImmediateOrDeferred<T> = T | Promise<undefined>;
export declare function ImmediateOrDeferred<T>(value: T): ImmediateOrDeferred<T>;
export type MaybePromiseNotNull<R = any> = R;
export declare function MaybePromiseNotNull<R = any>(v: R): MaybePromise;
export type MaybePromiseCheat<R = any> = R;
export declare function MaybePromiseCheat<R = any>(v: R): MaybePromise;
export type MaybePromise<R = any> = R;
export declare function MaybePromise<R = any>(v: R): MaybePromise;
export declare function MaybeNakedPromise(v: any): any;
