import { getCallerLocation } from "../tricks/get_caller_location";
import { makeStub } from "../tricks/stubs";
import ZeroStore from './zero_store';
export function zeroNexusMirror(excludeName) {
    return new Proxy({}, {
        get: (_t, name) => {
            if (name === excludeName)
                return makeStub({ category: excludeName, key: name, location: getCallerLocation() });
            return new Proxy([], {
                get: (_s, prop) => {
                    const arr = ZeroStore.get(name);
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
