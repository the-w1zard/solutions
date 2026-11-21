// sauron/resource.ts
export function resource(loader, options = {}) {
    const scope = options.scope ?? createScope(() => { });
    const data = signal(options.initial);
    const loading = signal(false);
    const error = signal(null);
    let generation = 0;
    const load = async () => {
        const current = ++generation;
        const controller = new AbortController();
        onScopeCleanup(() => controller.abort());
        loading(true);
        error(null);
        try {
            const value = await loader(controller.signal, data.peek());
            // Ignore stale completions.
            if (current !== generation || controller.signal.aborted)
                return;
            data(value);
        }
        catch (err) {
            if (current !== generation || controller.signal.aborted)
                return;
            error(err);
        }
        finally {
            if (current === generation && !controller.signal.aborted) {
                loading(false);
            }
        }
    };
    // Revalidate automatically when the trigger changes.
    effect(() => {
        options.revalidate?.();
        void load();
    });
    scope.cleanups.add(() => {
        generation++;
        loading(false);
    });
    return {
        data,
        loading,
        error,
        reload: load,
        dispose: () => scope.dispose(),
    };
}
