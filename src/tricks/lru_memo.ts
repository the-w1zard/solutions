


// ─── LRU MEMO ────────────────────────────────────────────────────────────────
export const MEMO_CAP = 500
export const memo = new Map<string, string>()
export function memoize(key: string, compute: () => string): string {
    if (memo.has(key)) {
        const val = memo.get(key)!
        memo.delete(key)
        memo.set(key, val)
        return val
    }
    const result = compute()
    if (memo.size >= MEMO_CAP) {
        const oldest = memo.keys().next().value
        if (oldest !== undefined) memo.delete(oldest)
    }
    memo.set(key, result)
    return result
}

