

export function resolveResponsive<T>(value: any): T | undefined {
  if (value === undefined) return undefined
  if (typeof value === "object" && value !== null && ("sm" in value || "md" in value || "lg" in value || "xl" in value || "2xl" in value)) {
    const breakpoints = ["sm", "md", "lg", "xl", "2xl"] as const
    const classes: string[] = []
    for (const bp of breakpoints) {
      const v = (value as any)[bp]
      if (v !== undefined) classes.push(`${bp}:${v}`)
    }
    return classes.join(" ") as unknown as T
  }
  return value as T
}
