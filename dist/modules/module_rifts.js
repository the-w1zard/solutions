export class MODULE_RIFTS {
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
    // private loaded = new Map<string, A>();
    // private inflight = new Map<string, Promise<A>>();
    root;
    constructor(root = null) { this.root = root; }
    FULFIL_THIS_NOW(r) { this.root = r; }
    REFRESH_ROOT() { return this.root.acquire_root('MODULE_RIFTS'); }
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
    static loaded = new Map();
    static inflight = new Map();
    static moduleExports = new Map();
    isLoaded(specifier) {
        return MODULE_RIFTS.loaded.has(this.keyFor(specifier));
    }
    keyFor(specifier) {
        try {
            return import.meta.resolve(specifier);
        }
        catch {
            return new URL(specifier, import.meta.url).href;
        }
    }
    get modules() { return MODULE_RIFTS.loaded; }
    getLoaded(specifier) {
        return MODULE_RIFTS.loaded.get(this.keyFor(specifier));
    }
    indexExports(key, mod) {
        for (const name of Object.keys(mod)) {
            let sources = MODULE_RIFTS.moduleExports.get(name);
            if (!sources) {
                sources = new Map();
                MODULE_RIFTS.moduleExports.set(name, sources);
            }
            sources.set(key, mod[name]);
        }
    }
    export(name, specifier) {
        if (specifier !== undefined) {
            const mod = this.getLoaded(specifier);
            return mod?.[name];
        }
        const sources = MODULE_RIFTS.moduleExports.get(name);
        if (!sources || sources.size === 0)
            return undefined;
        if (sources.size > 1) {
            throw new Error(`Ambiguous export "${name}" found in: ${[...sources.keys()].join(', ')}`);
        }
        return sources.values().next().value;
    }
    load(specifier) {
        const key = this.keyFor(specifier);
        if (MODULE_RIFTS.loaded.has(key))
            return Promise.resolve(MODULE_RIFTS.loaded.get(key));
        if (MODULE_RIFTS.inflight.has(key))
            return MODULE_RIFTS.inflight.get(key);
        const p = import(key).then(mod => {
            MODULE_RIFTS.loaded.set(key, mod);
            MODULE_RIFTS.inflight.delete(key);
            return mod;
        }).catch(err => {
            MODULE_RIFTS.inflight.delete(key); // let it retry later
            throw err;
        });
        MODULE_RIFTS.inflight.set(key, p);
        return p;
    }
}
