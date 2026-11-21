

// ─── PRESETS ──────────────────────────────────────────────────────────────────
export const presets = new Map<string, Record<string, any>>()
export function registerPreset(name: string, variants: Record<string, any>): void { presets.set(name, variants) }
export function getPreset(name: string): Record<string, any> | undefined { return presets.get(name) }


