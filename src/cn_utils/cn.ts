import { clsx, type ClassValue } from "./clsx.js"
import { twMerge } from "./tw.js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
