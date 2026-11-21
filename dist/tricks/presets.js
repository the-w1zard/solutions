// ─── PRESETS ──────────────────────────────────────────────────────────────────
export const presets = new Map();
export function registerPreset(name, variants) { presets.set(name, variants); }
export function getPreset(name) { return presets.get(name); }
