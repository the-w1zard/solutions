import type { AnyConfig } from "./types";
/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
export declare const createSortModifiers: (config: AnyConfig) => (modifiers: readonly string[]) => string[];
