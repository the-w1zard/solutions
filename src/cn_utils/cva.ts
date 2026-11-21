type ClassValue = string | undefined | null | false | ClassValue[];

function cx(...inputs: ClassValue[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      result.push(input);
    } else if (Array.isArray(input)) {
      const inner = cx(...input);
      if (inner) result.push(inner);
    }
  }
  return result.join(' ');
}

type VariantRecord = Record<string, Record<string, ClassValue>>;

type VariantSelection<V extends VariantRecord> = {
  [K in keyof V]?: keyof V[K];
};



interface CVAConfig<V extends VariantRecord> {
  variants?: V;
  defaultVariants?: VariantSelection<V>;
  compoundVariants?: (VariantSelection<V> & { class: ClassValue })[];
}

export function cva<V extends VariantRecord>(
  base: ClassValue,
  config?: CVAConfig<V>
): (props?: VariantSelection<V> & { class?: ClassValue }) => string {
  return (props) => {
    const classes: ClassValue[] = [base];

    if (config?.variants && props) {
      for (const variant in config.variants) {
        const key = variant as keyof V;
        const value = props[key] ?? config.defaultVariants?.[key];
        if (value !== undefined) {
          classes.push(config.variants[key][value as string]);
        }
      }
    } else if (config?.variants && config.defaultVariants) {
      for (const variant in config.defaultVariants) {
        const key = variant as keyof V;
        const value = config.defaultVariants[key];
        if (value !== undefined) {
          classes.push(config.variants[key][value as string]);
        }
      }
    }

    if (config?.compoundVariants && props) {
      for (const compound of config.compoundVariants) {
        const { class: compoundClass, ...conditions } = compound;
        const matches = Object.entries(conditions).every(([k, v]) => {
          const selected = props[k as keyof V] ?? config.defaultVariants?.[k as keyof V];
          return selected === v;
        });
        if (matches) classes.push(compoundClass);
      }
    }

    if (props?.class) classes.push(props.class);

    return cx(...classes);
  };
}
