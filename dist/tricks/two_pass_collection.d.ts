export declare function twoPassCollection<R extends Record<string, any>>(categoryName: string, factory: (ctx: SelfType) => R): {
    pass2: R;
    refs: any;
};
