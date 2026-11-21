import { clsx } from "./clsx.js";
import { twMerge } from "./tw.js";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
