import type { AnyConfig, ParsedClassName } from "./types";
export declare const IMPORTANT_MODIFIER = "!";
export declare const createParseClassName: (config: AnyConfig) => (className: string) => ParsedClassName;
