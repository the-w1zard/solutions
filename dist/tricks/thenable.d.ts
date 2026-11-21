export declare function thenable<T>(value: T | Promise<T>): Promise<Awaited<T> | Awaited<T>>;
/**
return chain(result)
*/
export declare class Thenable<T> {
    private value;
    constructor(value: T);
    then<TResult>(resolve: (value: T) => TResult): Thenable<TResult>;
}
/**
return new Chain(result)
*/
