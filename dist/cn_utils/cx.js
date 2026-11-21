import { clsx } from "./clsx";
import { twMerge } from "./tw";
export const cx = (...inputs) => twMerge(clsx(inputs));
