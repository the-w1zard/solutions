type ClassValue = string | undefined | null | false | ClassValue[];
type VariantRecord = Record<string, Record<string, ClassValue>>;
type VariantSelection<V extends VariantRecord> = {
    [K in keyof V]?: keyof V[K];
};
interface CVAConfig<V extends VariantRecord> {
    variants?: V;
    defaultVariants?: VariantSelection<V>;
    compoundVariants?: (VariantSelection<V> & {
        class: ClassValue;
    })[];
}
export declare function cva<V extends VariantRecord>(base: ClassValue, config?: CVAConfig<V>): (props?: VariantSelection<V> & {
    class?: ClassValue;
}) => string;
export {};
