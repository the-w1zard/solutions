export interface Resource<T> {
    data: Signal<T | undefined>;
    loading: Signal<boolean>;
    error: Signal<unknown | null>;
    reload(): Promise<void>;
    dispose(): void;
}
export declare function resource<T>(loader: (abort: AbortSignal, previous: T | undefined) => Promise<T>, options?: {
    scope?: Scope;
    initial?: T;
    revalidate?: Signal<unknown>;
}): Resource<T>;
