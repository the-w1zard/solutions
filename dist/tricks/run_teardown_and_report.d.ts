export type Teardown = void | null | (() => void) | {
    unsubscribe(): void;
} | {
    [Symbol.dispose](): void;
} | Teardown[];
export declare function runTeardown(t: Teardown): void;
export declare function reportError(e: unknown): void;
