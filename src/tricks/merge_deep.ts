


export function mergeDeep(a: Record<string, any>, b: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = { ...a }
  for (const key in b) {
    if (typeof b[key] === 'object' && b[key] !== null && !Array.isArray(b[key]) && typeof a[key] === 'object' && a[key] !== null && !Array.isArray(a[key])) {
      result[key] = mergeDeep(a[key], b[key])
    } else {
      result[key] = b[key]
    }
  }
  return result
}
