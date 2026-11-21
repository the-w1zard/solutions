import { getCallerLocation } from "../tricks/get_caller_location";
import { makeStub } from "../tricks/stubs";
import ZeroStore from './zero_store'

export function zeroNexusMirror(excludeName: string) {
	return new Proxy({}, {
        get: (_t: A, name: string) => {
            if (name === excludeName) return makeStub({ category: excludeName, key: name, location: getCallerLocation() });
            return new Proxy([], {
                get: (_s: A, prop: string | symbol) => {
                    const arr = ZeroStore.get(name);
                    if (!arr) return makeStub({ category: name, key: String(prop), location: getCallerLocation() });
                    if (prop in arr) return (arr as A)[prop];
                    return makeStub({ category: name, key: String(prop), location: getCallerLocation() });
                }
            });
        }
    });
}
