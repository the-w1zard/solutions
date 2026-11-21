export class DER_SER {
    ser(value) {
        if (value instanceof Map) {
            return JSON.stringify({
                __type: 'Map',
                value: Array.from(value.entries()).map(([key, val]) => [this.ser(key), this.ser(val)])
            });
        }
        if (value instanceof Set) {
            return JSON.stringify({
                __type: 'Set',
                value: Array.from(value.values()).map(val => this.ser(val))
            });
        }
        if (Array.isArray(value)) {
            return JSON.stringify({
                __type: 'Array',
                value: value.map(item => this.ser(item))
            });
        }
        if (value !== null && typeof value === 'object') {
            const obj = {};
            for (const [key, val] of Object.entries(value)) {
                obj[key] = this.ser(val);
            }
            return JSON.stringify({
                __type: 'Object',
                value: obj
            });
        }
        // Wrap primitives (strings, numbers, booleans, null) to preserve exact types
        return JSON.stringify({
            __type: 'Primitive',
            value
        });
    }
    deser(raw) {
        if (raw === null || raw === undefined)
            return raw;
        try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (parsed?.__type === 'Map') {
                return new Map(parsed.value.map(([key, val]) => [this.deser(key), this.deser(val)]));
            }
            if (parsed?.__type === 'Set') {
                return new Set(parsed.value.map((val) => this.deser(val)));
            }
            if (parsed?.__type === 'Array') {
                return parsed.value.map((val) => this.deser(val));
            }
            if (parsed?.__type === 'Object') {
                const obj = {};
                for (const [key, val] of Object.entries(parsed.value)) {
                    obj[key] = this.deser(val);
                }
                return obj;
            }
            if (parsed?.__type === 'Primitive') {
                return parsed.value;
            }
            return parsed;
        }
        catch {
            return raw;
        }
    }
}
