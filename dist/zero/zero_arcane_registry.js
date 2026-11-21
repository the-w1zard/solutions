import { useSXX } from '../tricks/ssx';
import ZeroStore from './zero_store';
export function zeroArcaneRegistry(name, result) {
    const [s, setS] = useSXX(false); //useState(false)
    if (s === false) {
        for (const [key, values] of Object.entries(ZeroStore.getAll())) {
            const existing = ZeroStore.get(key);
            if (existing !== undefined)
                continue;
            for (const value of values) {
                ZeroStore.set(key, value);
            }
        }
        setS(true);
    }
}
