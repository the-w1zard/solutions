export function thenable(value) {
    return Promise.resolve(value);
}
/**
return chain(result)
*/
export class Thenable {
    value;
    constructor(value) {
        this.value = value;
    }
    then(resolve) {
        return new Thenable(resolve(this.value));
    }
}
/**
return new Chain(result)
*/
