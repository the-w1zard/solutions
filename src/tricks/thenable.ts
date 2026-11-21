

export function thenable<T>(value: T | Promise<T>) {
    return Promise.resolve(value);
}
/**
return chain(result)
*/

export class Thenable<T> {
    constructor(private value: T) {}

    then<TResult>(
        resolve: (value: T) => TResult
    ) {
        return new Thenable(resolve(this.value));
    }
}
/**
return new Chain(result)
*/


