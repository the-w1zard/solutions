type WaiterDep = SignalKey | SignalKey[];
type WaiterFn<T = any> = (v?: T) => void;
export declare class WAITER_REGISTRY {
    root: A;
    constructor(root?: A);
    FULFIL_THIS_NOW(r: A): void;
    REFRESH_ROOT(): any;
    private entries;
    private byKey;
    private nextId;
    WAIT_FOR<T = any>(deps: WaiterDep, fn: WaiterFn<T>): number;
    READY<T = any>(k: SignalKey, v?: T): void;
    CANCEL_WAIT(id: number): boolean;
    private remove;
}
export {};
/**
 *
public waiters = new WAITER_REGISTRY();
 *
this.waiters.READY(atom.key, value);
 *
waiters.WAIT_FOR('staff', () => {
    staff.initializeSomething();
});
 *
waiters.WAIT_FOR(['staff', 'database'], () => {
    // Runs after both dependencies are ready.
});
 */
