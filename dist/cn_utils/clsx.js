export function clsx(...inputs) {
    const result = [];
    for (const input of inputs) {
        if (!input && input !== 0)
            continue;
        if (typeof input === 'string' || typeof input === 'number') {
            result.push(String(input));
        }
        else if (Array.isArray(input)) {
            const inner = clsx(...input);
            if (inner)
                result.push(inner);
        }
        else if (typeof input === 'object') {
            for (const key in input) {
                if (input[key])
                    result.push(key);
            }
        }
    }
    return result.join(' ');
}
