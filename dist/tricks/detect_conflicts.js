// ─── CONFLICT DETECTION ───────────────────────────────────────────────────────
export const TAILWIND_CONFLICT_GROUPS = [
    /^(text|bg|border|ring|shadow|fill|stroke|accent|caret|decoration)-/,
    /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-/,
    /^(w|h|min-w|min-h|max-w|max-h)-/,
    /^(flex|grid|col|row|gap|space)-/,
    /^(font|leading|tracking|text)-/,
    /^(rounded|border|outline)-/,
    /^(opacity|z|order|basis)-/,
];
export function detectConflicts(classes) {
    const seen = new Map();
    const conflicts = [];
    for (const cls of classes) {
        const bare = cls.replace(/^(sm|md|lg|xl|2xl|dark|hover|focus|active|group-hover):/, "");
        for (const pattern of TAILWIND_CONFLICT_GROUPS) {
            const match = bare.match(pattern);
            if (match) {
                const group = match[0];
                if (seen.has(group))
                    conflicts.push(`Conflict: "${seen.get(group)}" vs "${cls}"`);
                else
                    seen.set(group, cls);
            }
        }
    }
    return conflicts;
}
