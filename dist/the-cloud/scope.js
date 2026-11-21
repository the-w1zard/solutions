// sauron/scope.ts
let activeScope = null;
export function getScope() {
    return activeScope;
}
export function createScope(fn, parent = activeScope) {
    const scope = {
        id: crypto.randomUUID(),
        parent,
        disposed: false,
        children: new Set(),
        cleanups: new Set(),
        abort: new AbortController(),
        run(task) {
            const previous = activeScope;
            activeScope = scope;
            try {
                return task();
            }
            finally {
                activeScope = previous;
            }
        },
        dispose() {
            if (scope.disposed)
                return;
            scope.disposed = true;
            scope.abort.abort();
            for (const child of [...scope.children]) {
                child.dispose();
            }
            for (const cleanup of [...scope.cleanups].reverse()) {
                try {
                    cleanup();
                }
                catch (error) {
                    reportError(error);
                }
            }
            scope.children.clear();
            scope.cleanups.clear();
            parent?.children.delete(scope);
        },
    };
    parent?.children.add(scope);
    const result = scope.run(() => fn(scope));
    // The critical part Solid makes users do manually:
    // preserve ownership across await.
    if (result instanceof Promise) {
        result.catch((error) => reportError(error));
    }
    return scope;
}
export function onScopeCleanup(disposer) {
    if (!activeScope) {
        throw new Error('[Sauron] onScopeCleanup() called outside a scope');
    }
    activeScope.cleanups.add(disposer);
}
export function withScope(scope, fn) {
    return scope.run(fn);
}
