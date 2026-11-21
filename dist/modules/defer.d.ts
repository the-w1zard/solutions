type DeferredKey = string;
export declare class DEFER_ENGINE {
    /**   public t: any = {}
       private _useRifts() {
         return disruptor.useSClass.mailbox(this, 'MAELSTROM', 'RIFTS', disruptor.ms, disruptor.rt);
     }
     constructor() {
         const [v, setV] = this._useRifts()
         setPrev(setV, this)
         this.t = v
         useEffect(() => { this.t = v }, [v])
      }

         public root: A
 constructor(root: A = null) { this.root = root }
 public FULFIL_THIS_NOW(r: A) { this.root = r }
   public  REFRESH_ROOT() { return this.root.acquire_root('CONJURE_MODULES') }
*/
    private deps;
    private tasks;
    private nextId;
    private draining;
    private drainAgain;
    private stats;
    private onError;
    private onSuccess;
    run(deps: DeferredKey | DeferredKey[], fn: (...v: any[]) => any): number;
    provide(k: DeferredKey, v: any): void;
    provide(deps: Record<DeferredKey, any>): void;
    resolve(k: DeferredKey): void;
    invalidate(k: DeferredKey): boolean;
    has(k: DeferredKey): boolean;
    get<T = any>(k: DeferredKey): T | undefined;
    cancel(id: number): boolean;
    private ready;
    private drain;
    private report;
    inspect(): {
        stats: {
            registered: number;
            executed: number;
            completed: number;
            failed: number;
            cancelled: number;
        };
        dependencies: {
            key: string;
            version: number;
        }[];
        pending: {
            id: number;
            deps: string[];
            missing: string[];
        }[];
        running: {
            id: number;
            deps: string[];
        }[];
    };
    clear(): void;
}
export declare const DEFER_: DEFER_ENGINE;
export {};
/**
defer.provide('DISPATCH_ENGINE._sub', this.DISRUPTOR_LVL2);


defer.run(['DISPATCH_ENGINE._sub', 'ATOM'],(d, atom) => {
    // Runs only when both dependencies are available.
});

defer.run('DISPATCH_ENGINE._sub', (d, atom) => {
    // Runs only when both dependencies are available.
});
DEV_LOG('ENGINE constructor', 'ENGINE');
DEV_LOG('Dispatch started', 'DISPATCH');

// Change destinations at runtime.
logger.setWriteToFile(false); // Console
logger.setWriteToFile(true);  // File

// Change the output file.
logger.setFilePath('./logs/hc-test.log');

// Wait for queued file writes, e.g. before a test exits.
await logger.flush();
 */
