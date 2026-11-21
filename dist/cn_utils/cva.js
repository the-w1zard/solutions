function cx(...inputs) {
    const result = [];
    for (const input of inputs) {
        if (!input)
            continue;
        if (typeof input === 'string') {
            result.push(input);
        }
        else if (Array.isArray(input)) {
            const inner = cx(...input);
            if (inner)
                result.push(inner);
        }
    }
    return result.join(' ');
}
export function cva(base, config) {
    return (props) => {
        const classes = [base];
        if (config?.variants && props) {
            for (const variant in config.variants) {
                const key = variant;
                const value = props[key] ?? config.defaultVariants?.[key];
                if (value !== undefined) {
                    classes.push(config.variants[key][value]);
                }
            }
        }
        else if (config?.variants && config.defaultVariants) {
            for (const variant in config.defaultVariants) {
                const key = variant;
                const value = config.defaultVariants[key];
                if (value !== undefined) {
                    classes.push(config.variants[key][value]);
                }
            }
        }
        if (config?.compoundVariants && props) {
            for (const compound of config.compoundVariants) {
                const { class: compoundClass, ...conditions } = compound;
                const matches = Object.entries(conditions).every(([k, v]) => {
                    const selected = props[k] ?? config.defaultVariants?.[k];
                    return selected === v;
                });
                if (matches)
                    classes.push(compoundClass);
            }
        }
        if (props?.class)
            classes.push(props.class);
        return cx(...classes);
    };
}
