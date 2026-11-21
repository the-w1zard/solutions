import Store from '#STR';
import { getCallerLocation } from "./get_caller_location";
import { makeStub } from "./stubs";
export function NexusMirror(excludeName) {
    return new Proxy({}, {
        get: (_t, name) => {
            if (name === excludeName)
                return makeStub({ category: excludeName, key: name, location: getCallerLocation() });
            function get_bare_state(key) {
                const value = Store.get(key);
                if (value !== undefined)
                    return MaybePromise(value);
                return undefined;
            }
            return new Proxy([], {
                get: (_s, prop) => {
                    const arr = get_bare_state(name);
                    if (!arr)
                        return makeStub({ category: name, key: String(prop), location: getCallerLocation() });
                    if (prop in arr)
                        return arr[prop];
                    return makeStub({ category: name, key: String(prop), location: getCallerLocation() });
                }
            });
        }
    });
}
