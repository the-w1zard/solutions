

// ─── PROP EXTRACTION UTILS ────────────────────────────────────────────────────
export type KERNEL_PROPS<T extends (...args: any[]) => string> = T extends (props?: infer P) => string ? P extends { [K in keyof P]: any } ? P : never : never
export type INTERFACE_PROPS<T extends (...args: any[]) => string> = T extends { interface: infer I } ? I : never
export type TYPES_PROPS<T extends (...args: any[]) => string> = T extends { types: infer TY } ? TY : never
// ─── kernel AND kernel FUNCTION TYPES ────────────────────────────────────────────────────────────────────
export type OmitUndefined<T> = T extends undefined ? never : T;
export type kernelProps<Component extends (...args: any) => any> = Omit<OmitUndefined<Parameters<Component>[0]>, "class" | "className">;
