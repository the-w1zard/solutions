export type Disposer = () => void;
export interface Scope {
    id: string;
    parent: Scope | null;
    disposed: boolean;
    children: Set<Scope>;
    cleanups: Set<Disposer>;
    abort: AbortController;
    run<T>(fn: () => T): T;
    dispose(): void;
}
export declare function getScope(): Scope | null;
export declare function createScope(fn: (scope: Scope) => void | Promise<void>, parent?: Scope | null): Scope;
export declare function onScopeCleanup(disposer: Disposer): void;
export declare function withScope<T>(scope: Scope, fn: () => T): T;
