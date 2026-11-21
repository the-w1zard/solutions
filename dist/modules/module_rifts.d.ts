export declare class MODULE_RIFTS {
    /**
 * import { load, isLoaded, getLoaded } from './loader';
 *
  // During init — idempotent, safe to call regardless
   await rifts.load('the-cloud/hook-system');
 
   // Later — check without triggering
   if (rifts.isLoaded('the-cloud/hook-system')) {
     const mod = rifts.getLoaded('the-cloud/hook-system');
     mod.store // use it
   }

   

   // Load any module at runtime.
    await rifts.load('./some-module.js');

    // Inspect loaded modules.
    for (const [path, mod] of rifts.modules) {
        console.log(path, Object.keys(mod));
    }

    // Discover an export across all loaded modules.
    const fn = rifts.export<(v: string) => void>('someFunction');

    // Or get an export from a specific loaded module.
    const mod = rifts.export('someFunction', './some-module.js');


    import { resolve } from '#rifts/resolve';

    const mod = await resolve('./some-module.js');

    const fn = rifts.export('someFunction');
 */
    root: A;
    constructor(root?: A);
    FULFIL_THIS_NOW(r: A): void;
    REFRESH_ROOT(): any;
    /**  public t: any = {}
           private _useRifts() {
             return disruptor.useSClass.mailbox(this, 'MAELSTROM', 'RIFTS', disruptor.ms, disruptor.rt);
         }
         constructor() {
             const [v, setV] = this._useRifts()
             setPrev(setV, this)
             this.t = v
             useEffect(() => { this.t = v }, [v])
          }
  */
    static loaded: Map<string, any>;
    private static inflight;
    private static moduleExports;
    isLoaded(specifier: string): boolean;
    keyFor(specifier: string): string;
    get modules(): ReadonlyMap<string, A>;
    getLoaded<T = A>(specifier: string): T | undefined;
    private indexExports;
    export<T = A>(name: string, specifier?: string): T | undefined;
    load<T = A>(specifier: string): Promise<T>;
}
