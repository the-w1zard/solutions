import {  clsx, type ClassValue } from "./clsx";
import { twMerge } from "./tw";

export const cx = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
