/**export function barrier(n: number) {
 const { promise, resolve } = gate<void>()
 let arrived = 0
 return {
   arrive() { if (++arrived >= n) resolve() },
   wait() { return promise },
 }
}
*/
export declare function barrier(n: number): {
    arrive(): void;
    wait(): Promise<void>;
};
