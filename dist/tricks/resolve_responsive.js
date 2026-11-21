export function resolveResponsive(value) {
    if (value === undefined)
        return undefined;
    if (typeof value === "object" && value !== null && ("sm" in value || "md" in value || "lg" in value || "xl" in value || "2xl" in value)) {
        const breakpoints = ["sm", "md", "lg", "xl", "2xl"];
        const classes = [];
        for (const bp of breakpoints) {
            const v = value[bp];
            if (v !== undefined)
                classes.push(`${bp}:${v}`);
        }
        return classes.join(" ");
    }
    return value;
}
