export type MaybePromise<R = any> = R;
export function MaybePromise<R = any>(v: R): MaybePromise {
    return v !== undefined ? v as R : Promise.resolve(v) as Promise<R> 
}

export type MaybeUndefined<R = any> = R;
export function MaybeUndefined<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v as R : Promise.resolve(v) as Promise<R>
}
export type MaybeNull<R = any> = R;
export function MaybeNull<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v as R : Promise.resolve(v) as Promise<R>
}
