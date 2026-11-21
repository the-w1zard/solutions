export interface BackoffOptions {
    base?: number;
    factor?: number;
    max?: number;
    jitter?: boolean;
}
export declare function computeBackoff(attempt: number, opts: Required<BackoffOptions>): number;
