/**
 * 
 */
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════



export const c = {
  emerald: {
    10: '#002c22',
    9: '#004f3b',
    8: '#016630',
    7: '#007a55',
    6: '#009966',
    5: '#00bc7d',
  },
  blue: {
    10: '',
    9: '',
    8: '',
    7: '',
    6: '',
    5: '',
  },
}
export const t = {
  deep: {
    bg: '#020817',
    txt: '#f8fafc',
    size: 12,
    title_size: 14,
    title_txt: '#94a3b8',
    payload_key: '#a4ed2c',
    payload_value: '#f8fafc',
    font: 'monospace',
    border: '2px solid #101727',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: '',
  },
  vintage: {
    bg: '#001B29',
    txt: '#e9e1ba',
    size: 12,
    title_size: 14,
    title_txt: '#ada785',
    payload_key: '#29c3a0',
    payload_value: '#fafafa',
    font: 'monospace',
    border: '2px solid #112932',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: '',
  },
  error: {
    bg: '#09090B',
    txt: '#e7000b',
    size: 12,
    title_size: 14,
    title_txt: '#9f0712',
    payload_key: '#a4ed2c',
    payload_value: '#f8fafc',
    font: 'monospace',
    border: '2px solid #e7000b',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e7000b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  },
  warn: {
    bg: '#09090B',
    txt: '#e17100',
    size: 12,
    title_size: 14,
    title_txt: '#973c00',
    payload_key: '#a4ed2c',
    payload_value: '#f8fafc',
    font: 'monospace',
    border: '2px solid #e17100',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e17100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  },
  success: {
    bg: '#09090B',
    txt: '#009966',
    size: 12,
    title_size: 14,
    title_txt: '#016630',
    payload_key: '#a4ed2c',
    payload_value: '#f8fafc',
    font: 'monospace',
    border: '2px solid #009966',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009966" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`,
  },
  info: {
    bg: '#09090B',
    txt: '#155dfc',
    size: 12,
    title_size: 14,
    title_txt: '#193cb8',
    payload_key: '#a4ed2c',
    payload_value: '#f8fafc',
    font: 'monospace',
    border: '2px solid #155dfc',
    borderRadius: '6px',
    padding: '8px 16px',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#155dfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  },
}
export function log(msg: string | string[], p?: any, theme = t.deep) {
  const isArray = Array.isArray(msg);
  const title = isArray ? msg[0] : msg;
  const paragraphs = isArray ? msg.slice(1) : [];

  // Build container style (background + border + padding)
  const containerStyle = `
        background: ${theme.bg};
        ${theme.border ? `border: ${theme.border};` : ''}
        ${theme.borderRadius ? `border-radius: ${theme.borderRadius};` : ''}
        ${theme.padding ? `padding: ${theme.padding};` : ''}
        font-family: ${theme.font};
        display: block;
        margin: 4px 0;
    `;

  // Build title style (with SVG if present)
  const titleWithIcon = theme?.svg ? `${theme?.svg} ${title}` : title;
  const titleStyle = `
        color: ${theme.title_txt};
        font-size: ${theme.title_size}px;
        font-weight: bold;
        font-family: ${theme.font};
        display: flex;
        align-items: center;
        gap: 8px;
    `;

  // Build paragraph style
  const paragraphStyle = `
        color: ${theme.txt};
        font-size: ${theme.size}px;
        font-family: ${theme.font};
        margin-top: 4px;
    `;

  // Build p key/value styles
  const keyStyle = `
        color: ${theme.payload_key};
        font-weight: bold;
        font-family: ${theme.font};
    `;
  const valueStyle = `
        color: ${theme.payload_value};
        font-family: ${theme.font};
    `;

  // Format p as key: value pairs
  let payloadStr = '';
  if (p && typeof p === 'object') {
    const entries = Object.entries(p);
    payloadStr = entries
      .map(([key, value]) =>
        `%c${key}: %c${JSON.stringify(value, null, 2)}`
      )
      .join('\n');
  }

  // Build the final log
  const logParts = [
    `%c${titleWithIcon}`,
    ...paragraphs.map(p => `%c${p}`),
    payloadStr ? `\n${payloadStr}` : ''
  ].filter(Boolean).join('\n');

  const styles = [
    containerStyle + titleStyle,  // Container + title combined
    ...paragraphs.map(() => paragraphStyle),
    ...(payloadStr ? [keyStyle, valueStyle] : [])
  ];

  console.log(logParts, ...styles);
  // const dev_tools = get('DEVTOOLS_ACTIVE')
  // if (dev_tools === true) console.log(logParts, ...styles);
}
// #endregion 🢀
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════
type U = undefined;
type UU<UUU = undefined> = UUU;
type Y = symbol;
type YY<YYY = symbol> = YYY;
type S = string;
type SS<SSS = symbol> = SSS;
type SU<SUU = string | undefined> = SUU
type PP<PPP = Promise<any>> = PPP;
type SYU = S | Y | U;
type SY = S | Y;
type MSP<T = string> = T;
type MbStrPromise<T = any> = MSP<T>;
// #endregion 🢀
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// type MaybePromise<T = any> = MaybePromise_3<T> 

type V<T = any> = T;
type P<T = any> = Promise<T>;

type SZU<T = Promise<any>> = [T] extends [undefined] ? undefined : T
type MaybePromise_3<T = any> = V<T> | P<T>;
function MaybePromise_3<SZ = SZU<any>>(value: SZU<SZ>) {
  return value !== undefined ? value as SZ : Promise.resolve(value) as SZ
}


export type MaybeUndefined<R = any> = R;
export function MaybeUndefined<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v as R : Promise.resolve(v) as Promise<R>
}
export type MaybeNull<R = any> = R;
export function MaybeNull<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v as R : Promise.resolve(v) as Promise<R>
}


export type MaybeDeferred<T> = T extends undefined ? Promise<undefined> : T

export function MaybeDeferred<T>(value: T): MaybeDeferred<T> {
  return (value !== undefined ? value : Promise.resolve(undefined)) as MaybeDeferred<T>
}

export type ImmediateOrDeferred<T> = T | Promise<undefined>

export function ImmediateOrDeferred<T>(value: T,): ImmediateOrDeferred<T> {
  return value !== undefined  ? value : Promise.resolve(undefined)
}


export type MaybePromiseNotNull<R = any> = R;
export function MaybePromiseNotNull<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined || v != null  ? v as R : Promise.resolve(v) as Promise<R>
}
export type MaybePromiseCheat<R = any> = R;
export function MaybePromiseCheat<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined && !(v instanceof Promise)  ? v as R : Promise.resolve(v) as Promise<R>
}
export type MaybePromise<R = any> = R;
export function MaybePromise<R = any>(v: R): MaybePromise {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v as R : Promise.resolve(v) as Promise<R>
}
export function MaybeNakedPromise(v: any) {// ... IF value does NOT eq undefined, return value otherwise return promise(value)
  return v !== undefined ? v  : Promise.resolve(v)
}
// ═══════════════════════════════════════════════════════════════════
// BOUNDARY — exact setup, parameterized by variant
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════
// sync

function testFn<T>(s: T) {
  return s;
}
function syncRead<T = any>(value: T) {
  return MaybePromise(testFn(value));
}
// async
function testPromiseFn_2<T = any>(s: T) {
  return Promise.resolve(s);
}
async function testPromiseFn<T = any>(s: T) {
  const c_v = async () => { return s; }
  return await c_v();
}
async function asyncRead<T = any>(value: T) {
  return MaybePromise(testPromiseFn_2(value))
}
async function asyncRead2<T = any>(value: T) {
  return MaybePromise(testPromiseFn(value))
}
function makeBoundary(mp: <SZ = any>(value: any) => any) {
  function syncRead<T>(value: T | undefined) { return mp<T>(testFn(value)); }
  function asyncRead<T>(value: T | undefined) { return mp<T>(testPromiseFn(value)); }
  return { syncRead, asyncRead }
}

function makeBoundary1(mp: <SZ = any>(value: any) => any) {
  function syncRead<T>(value: T | undefined) { return mp<T>(testFn(value)); }
  function asyncRead<T>(value: T | undefined) { return mp<T>(testPromiseFn(value)); }
  return { syncRead, asyncRead }
}

function makeBoundary2(mp: <SZ = any>(value: any) => any) {
  function syncRead<T>(value: T | undefined) { return mp<T>(testFn(value)); }
  function asyncRead<T>(value: T | undefined) { return mp<T>(testPromiseFn(value)); }
  return { syncRead, asyncRead }
}



// #endregion 🢀
// ═══════════════════════════════════════════════════════════════════
// ASSERTIONS
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════
const B_666 = makeBoundary2(MaybeNakedPromise)
const B_66 = makeBoundary1(MaybeNakedPromise)
const B_6 = makeBoundary(MaybeNakedPromise)

const B_41 = makeBoundary2(MaybePromiseNotNull)
const B_3 = makeBoundary1(MaybePromiseNotNull)
const B_23 = makeBoundary(MaybePromiseNotNull)

const B_22 = makeBoundary2(MaybePromiseCheat)
const B_21 = makeBoundary1(MaybePromiseCheat)
const B_13 = makeBoundary(MaybePromiseCheat)

const B_12 = makeBoundary2(MaybePromise)
const B_11 = makeBoundary1(MaybePromise)
const B_main = makeBoundary(MaybePromise)
type Boundary = ReturnType<typeof makeBoundary>
function a_falsy_stays_sync({ syncRead }
  : Boundary) {
  return syncRead(0) === 0
    && Number.isNaN(syncRead(NaN))
    && syncRead('') === ''
    && syncRead(false) === false
    && syncRead(null) === null
    && syncRead(0n) === 0n
    && typeof syncRead(Symbol()) === 'symbol'
}
function a_undefined_goes_async({ syncRead }: Boundary) { return syncRead(undefined) instanceof Promise }
function a_null_stays_sync({ syncRead }: Boundary) { return !(syncRead(null) instanceof Promise) }
function a_promise_passes_through({ syncRead }: Boundary) { const p = Promise.resolve('inner'); return syncRead(p) === p }
function a_identity_preserved({ syncRead }: Boundary) {
  const obj = { a: 1 }, arr = [1, 2, 3], fn = () => 42
  const m = new Map([['k', 'v']]), s = new Set([1, 2])
  return syncRead(obj) === obj && syncRead(arr) === arr
    && syncRead(fn) === fn && syncRead(m) === m && syncRead(s) === s
}
function a_deep_sync_chain({ syncRead }: Boundary) {
  const deep = syncRead(syncRead(syncRead(syncRead(syncRead('deep')))))
  return deep === 'deep' && typeof deep === 'string'
}
async function a_undefined_round_trips({ syncRead }: Boundary) { return (await syncRead(undefined)) === undefined }
async function a_async_read_defined({ asyncRead }: Boundary) { return (await asyncRead('hello')) === 'hello' }
async function a_async_read_undefined({ asyncRead }: Boundary) { return (await asyncRead(undefined)) === undefined }
async function a_async_read_falsy({ asyncRead }: Boundary) {
  return (await asyncRead(0)) === 0
    && (await asyncRead('')) === ''
    && (await asyncRead(false)) === false
    && (await asyncRead(null)) === null
}
function a_async_read_returns_promise({ asyncRead }: Boundary) { return asyncRead('y') instanceof Promise }
async function a_sync_value_awaitable({ syncRead }: Boundary) { return (await syncRead('hello')) === 'hello' }
function a_thenable_passes_through({ syncRead }: Boundary) { const thenable = { then: (res: any) => res('v') }; return syncRead(thenable) === thenable }
async function a_sync_feeds_async(b: Boundary) { return (await b.asyncRead(b.syncRead('b'))) === 'b' }
async function a_async_feeds_sync(b: Boundary) { return b.syncRead(await b.asyncRead('c')) === 'c' }
function a_async_feeds_sync_as_promise({ syncRead, asyncRead }: Boundary) { return syncRead(asyncRead('c')) instanceof Promise }

// #endregion 🢀
// ═══════════════════════════════════════════════════════════════════
// DIFFERENTLY-SHAPED TESTS — each one exercises a different pattern
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// SHAPES 41–80 — new functional patterns
// ═══════════════════════════════════════════════════════════════════

// ── 41: result used in template literal ───────────────────────────
function t_template_literal({ syncRead }: Boundary) {
  const v = syncRead('world')
  if (v instanceof Promise) return false
  return `hello ${v}` === 'hello world'
}

// ── 42: result used in numeric arithmetic ─────────────────────────
function t_numeric_arithmetic({ syncRead }: Boundary) {
  const v = syncRead(10)
  if (v instanceof Promise) return false
  return (v as number) * 2 + 5 === 25
}

// ── 43: result used as boolean condition ──────────────────────────
function t_boolean_condition({ syncRead }: Boundary) {
  const v = syncRead(true)
  if (v instanceof Promise) return false
  if (v) return true
  return false
}

// ── 44: result spread into array ──────────────────────────────────
function t_spread_into_array({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3])
  if (arr instanceof Promise) return false
  const combined = [0, ...(arr as number[]), 4]
  return combined.length === 5 && combined[4] === 4
}

// ── 45: result spread into object ─────────────────────────────────
function t_spread_into_object({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1 })
  if (obj instanceof Promise) return false
  const merged = { ...(obj as any), b: 2 }
  return merged.a === 1 && merged.b === 2
}

// ── 46: result used as Map key ────────────────────────────────────
function t_result_as_map_key({ syncRead }: Boundary) {
  const key = syncRead('key')
  if (key instanceof Promise) return false
  const m = new Map<any, string>()
  m.set(key, 'value')
  return m.get('key') === 'value'
}

// ── 47: result used in array destructuring ────────────────────────
function t_array_destructure({ syncRead }: Boundary) {
  const arr = syncRead([10, 20, 30])
  if (arr instanceof Promise) return false
  const [a, b, c] = arr as number[]
  return a === 10 && b === 20 && c === 30
}

// ── 48: result passed through JSON.stringify ──────────────────────
function t_json_roundtrip({ syncRead }: Boundary) {
  const v = syncRead({ x: 1, y: 'two' })
  if (v instanceof Promise) return false
  const json = JSON.stringify(v)
  const back = JSON.parse(json)
  return back.x === 1 && back.y === 'two'
}

// ── 49: result with optional chaining ─────────────────────────────
function t_optional_chaining({ syncRead }: Boundary) {
  const v = syncRead({ nested: { deep: { value: 42 } } })
  if (v instanceof Promise) return false
  return (v as any)?.nested?.deep?.value === 42
}

// ── 50: result with nullish coalescing ────────────────────────────
function t_nullish_coalescing({ syncRead }: Boundary) {
  const v = syncRead(null)
  if (v instanceof Promise) return false
  return (v ?? 'default') === 'default'   // null IS null, ?? should fire
}

// ── 51: result with logical AND ───────────────────────────────────
function t_logical_and({ syncRead }: Boundary) {
  const v = syncRead(0)
  if (v instanceof Promise) return false
  return (v === 0 && 'zero') === 'zero'
}

// ── 52: result with logical OR ────────────────────────────────────
function t_logical_or({ syncRead }: Boundary) {
  const v = syncRead('')
  if (v instanceof Promise) return false
  return (v || 'fallback') === 'fallback'   // '' is falsy → falls back
}

// ── 53: result used in Array.isArray ──────────────────────────────
function t_array_is_array({ syncRead }: Boundary) {
  const v = syncRead([1, 2])
  if (v instanceof Promise) return false
  return Array.isArray(v) === true
}

// ── 54: result used in typeof ─────────────────────────────────────
function t_typeof_check({ syncRead }: Boundary) {
  const v = syncRead(42)
  if (v instanceof Promise) return false
  return typeof v === 'number'
}

// ── 55: result used in instanceof ─────────────────────────────────
function t_instanceof_check({ syncRead }: Boundary) {
  const v = syncRead(new Date())
  if (v instanceof Promise) return false
  return v instanceof Date
}

// ── 56: result in a conditional ternary ───────────────────────────
function t_ternary_on_result({ syncRead }: Boundary) {
  const v = syncRead(5)
  if (v instanceof Promise) return false
  return (v > 3 ? 'big' : 'small') === 'big'
}

// ── 57: result compared with Object.is ────────────────────────────
function t_object_is({ syncRead }: Boundary) {
  const v = syncRead(NaN)
  if (v instanceof Promise) return false
  return Object.is(v, NaN) === true
}

// ── 58: result with strict equality to null ───────────────────────
function t_strict_eq_null({ syncRead }: Boundary) {
  const v = syncRead(null)
  if (v instanceof Promise) return false
  return v === null
}

// ── 59: result with loose equality to undefined ───────────────────
function t_loose_eq_undefined({ syncRead }: Boundary) {
  const v = syncRead(null)
  if (v instanceof Promise) return false
  return (v == undefined) === true   // null == undefined is true
}

// ── 60: result in a while loop ────────────────────────────────────
function t_while_loop({ syncRead }: Boundary) {
  let v: any = syncRead(0)
  if (v instanceof Promise) return false
  let iterations = 0
  while (v < 3) { v++; iterations++ }
  return iterations === 3 && v === 3
}

// ── 61: result in a for loop ──────────────────────────────────────
function t_for_loop({ syncRead }: Boundary) {
  const limit = syncRead(3)
  if (limit instanceof Promise) return false
  let sum = 0
  for (let i = 0; i < (limit as number); i++) sum += i
  return sum === 3
}

// ── 62: result in reduce ──────────────────────────────────────────
function t_reduce({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3, 4])
  if (arr instanceof Promise) return false
  const sum = (arr as number[]).reduce((a, b) => a + b, 0)
  return sum === 10
}

// ── 63: result in map ─────────────────────────────────────────────
function t_map_method({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3])
  if (arr instanceof Promise) return false
  const doubled = (arr as number[]).map(n => n * 2)
  return doubled[0] === 2 && doubled[2] === 6
}

// ── 64: result in filter ──────────────────────────────────────────
function t_filter_method({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3, 4, 5])
  if (arr instanceof Promise) return false
  const evens = (arr as number[]).filter(n => n % 2 === 0)
  return evens.length === 2
}

// ── 65: result in find ────────────────────────────────────────────
function t_find_method({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3, 4])
  if (arr instanceof Promise) return false
  const found = (arr as number[]).find(n => n > 2)
  return found === 3
}

// ── 66: result in includes ────────────────────────────────────────
function t_includes_method({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3])
  if (arr instanceof Promise) return false
  return (arr as number[]).includes(2) === true
}

// ── 67: result in indexOf ─────────────────────────────────────────
function t_indexof_method({ syncRead }: Boundary) {
  const arr = syncRead(['a', 'b', 'c'])
  if (arr instanceof Promise) return false
  return (arr as string[]).indexOf('b') === 1
}

// ── 68: result in Object.keys ─────────────────────────────────────
function t_object_keys({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1, b: 2 })
  if (obj instanceof Promise) return false
  return Object.keys(obj as any).length === 2
}

// ── 69: result in Object.values ───────────────────────────────────
function t_object_values({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1, b: 2, c: 3 })
  if (obj instanceof Promise) return false
  const sum = Object.values(obj as any).reduce((a: any, b: any) => a + b, 0)
  return sum === 6
}

// ── 70: result in Object.entries ──────────────────────────────────
function t_object_entries({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1, b: 2 })
  if (obj instanceof Promise) return false
  const entries = Object.entries(obj as any)
  return entries.length === 2 && entries[0][0] === 'a'
}

// ── 71: result in Object.assign ───────────────────────────────────
function t_object_assign({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1 })
  if (obj instanceof Promise) return false
  const merged = Object.assign({}, obj, { b: 2 })
  return (merged as any).a === 1 && (merged as any).b === 2
}

// ── 72: result in Object.freeze ───────────────────────────────────
function t_object_freeze({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1 })
  if (obj instanceof Promise) return false
  const frozen = Object.freeze(obj as any)
  return Object.isFrozen(frozen)
}

// ── 73: result in structuredClone ─────────────────────────────────
function t_structured_clone({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1, b: [2, 3] })
  if (obj instanceof Promise) return false
  const cloned = structuredClone(obj)
  return (cloned as any).a === 1 && (cloned as any).b[0] === 2
}

// ── 74: result in a Set ───────────────────────────────────────────
function t_stored_in_set({ syncRead }: Boundary) {
  const v = syncRead('unique')
  if (v instanceof Promise) return false
  const s = new Set<string>()
  s.add(v as string)
  s.add(v as string)   // duplicate
  return s.size === 1
}

// ── 75: result in a WeakMap ───────────────────────────────────────
function t_stored_in_weakmap({ syncRead }: Boundary) {
  const key = syncRead({ id: 1 })
  if (key instanceof Promise) return false
  const wm = new WeakMap<object, string>()
  wm.set(key as object, 'value')
  return wm.get(key as object) === 'value'
}

// ── 76: result in a Symbol key ────────────────────────────────────
function t_symbol_key({ syncRead }: Boundary) {
  const sym = Symbol('test')
  const obj: any = {}
  const v = syncRead(sym)
  if (v instanceof Promise) return false
  obj[v as symbol] = 'symbol value'
  return obj[sym] === 'symbol value'
}

// ── 77: result used as a function argument ────────────────────────
function t_function_argument({ syncRead }: Boundary) {
  const double = (n: number) => n * 2
  const v = syncRead(21)
  if (v instanceof Promise) return false
  return double(v as number) === 42
}

// ── 78: result used as a return value ─────────────────────────────
function t_returned_from_inner({ syncRead }: Boundary) {
  const inner = () => syncRead('inner')
  const v = inner()
  return v === 'inner' && !(v instanceof Promise)
}

// ── 79: result in a Promise constructor ───────────────────────────
function t_promise_constructor({ syncRead }: Boundary) {
  const v = syncRead(100)
  if (v instanceof Promise) return false
  return new Promise<number>((resolve) => resolve(v as number)).then(n => n === 100)
}

// ── 80: result compared to another boundary result ────────────────
function t_compare_two_reads({ syncRead }: Boundary) {
  const a = syncRead(1)
  const b = syncRead(1)
  if (a instanceof Promise || b instanceof Promise) return false
  return a === b
}
// ── SHAPE 1: sync context, no await, direct use ───────────────────
function t_sync_direct_use({ syncRead }: Boundary) {
  const v = syncRead(42)
  if (v instanceof Promise) return false
  return v + 1 === 43       // use it as a number directly
}

// ── SHAPE 2: async context, await, direct use ─────────────────────
async function t_async_direct_use({ asyncRead }: Boundary) {
  const v = await asyncRead(42)
  return v + 1 === 43
}

// ── SHAPE 3: deferred await — store, then await later ─────────────
async function t_deferred_await({ syncRead }: Boundary) {
  const pending = syncRead(undefined)
  const stored = pending        // hold the promise
  await Promise.resolve()       // yield a tick
  return (await stored) === undefined
}

// ── SHAPE 4: Promise.all — multiple boundary calls batched ────────
async function t_promise_all({ syncRead }: Boundary) {
  const [a, b, c] = await Promise.all([
    syncRead(1),
    syncRead(2),
    syncRead(undefined),
  ])
  return a === 1 && b === 2 && c === undefined
}

// ── SHAPE 5: recursion — boundary fed back into boundary ──────────
function t_recursive_boundary({ syncRead }: Boundary) {
  const depth = 5
  let v: any = 'leaf'
  for (let i = 0; i < depth; i++) v = syncRead(v)
  return v === 'leaf' && !(v instanceof Promise)
}

// ── SHAPE 6: fire-and-forget — call, discard, no unhandled rejection ──
async function t_fire_and_forget({ syncRead }: Boundary) {
  syncRead(undefined)   // returns a Promise, we don't await it
  await Promise.resolve()
  return true           // if this resolved without an unhandled rejection, pass
}

// ── SHAPE 7: Promise input passes through raw ─────────────────────
function t_promise_input_identity({ syncRead }: Boundary) {
  const p = Promise.resolve('x')
  const out = syncRead(p)
  return out === p      // same reference, not re-wrapped
}

// ── SHAPE 8: thenable input passes through raw ────────────────────
function t_thenable_input_identity({ syncRead }: Boundary) {
  const thenable = { then: (res: any) => res('v') }
  const out = syncRead(thenable)
  return out === thenable
}

// ── SHAPE 9: ambiguous shape — callable with .then ────────────────
function t_callable_thenable({ syncRead }: Boundary) {
  const fn: any = () => 'called'
  fn.then = (res: any) => res('thened')
  const out = syncRead(fn)
  return out === fn && out() === 'called'
}

// ── SHAPE 10: iteration — use result in for..of ───────────────────
function t_iterable_use({ syncRead }: Boundary) {
  const arr = syncRead([1, 2, 3])
  if (arr instanceof Promise) return false
  let sum = 0
  for (const n of arr as number[]) sum += n
  return sum === 6
}

// ── SHAPE 11: destructuring the result ────────────────────────────
function t_destructure_result({ syncRead }: Boundary) {
  const obj = syncRead({ a: 1, b: 2 })
  if (obj instanceof Promise) return false
  const { a, b } = obj as { a: number; b: number }
  return a === 1 && b === 2
}

// ── SHAPE 12: method call on result ───────────────────────────────
function t_method_call({ syncRead }: Boundary) {
  const s = syncRead('hello world')
  if (s instanceof Promise) return false
  return (s as string).split(' ').length === 2
}

// ── SHAPE 13: negative — undefined must produce a Promise ─────────
function t_undefined_is_promise({ syncRead }: Boundary) {
  return syncRead(undefined) instanceof Promise
}

// ── SHAPE 14: canary — null must NOT produce a Promise ────────────
function t_null_is_not_promise({ syncRead }: Boundary) {
  return !(syncRead(null) instanceof Promise)
}

// ── SHAPE 15: sync path took no microtask ─────────────────────────
async function t_sync_path_no_microtask({ syncRead }: Boundary) {
  let afterSync = false
  const v = syncRead(42)
  if (!(v instanceof Promise)) {
    Promise.resolve().then(() => { afterSync = true })
  }
  const isSync = !(v instanceof Promise) && v === 42
  return isSync && afterSync === false   // microtask hasn't fired yet
}

// ── SHAPE 16: boundary inside try/catch ───────────────────────────
function t_inside_try_catch({ syncRead }: Boundary) {
  try {
    const v = syncRead(99)
    if (v instanceof Promise) return false
    return v === 99
  } catch {
    return false
  }
}

// ── SHAPE 17: boundary result stored in a Map ─────────────────────
function t_stored_in_map({ syncRead }: Boundary) {
  const m = new Map<string, any>()
  m.set('a', syncRead(1))
  m.set('b', syncRead(2))
  const a = m.get('a')
  const b = m.get('b')
  return !(a instanceof Promise) && !(b instanceof Promise) && a === 1 && b === 2
}

// ── SHAPE 18: boundary result passed as argument ──────────────────
function t_passed_as_arg({ syncRead }: Boundary) {
  const identify = (x: any) => x
  const v = identify(syncRead('arg'))
  return v === 'arg' && !(v instanceof Promise)
}

// ── SHAPE 19: boundary result in switch ───────────────────────────
function t_switch_on_result({ syncRead }: Boundary) {
  const v = syncRead('case-b')
  if (v instanceof Promise) return false
  switch (v) {
    case 'case-a': return false
    case 'case-b': return true
    default: return false
  }
}

// ── SHAPE 20: nested boundaries with different types ──────────────
function t_nested_mixed_types({ syncRead }: Boundary) {
  const a = syncRead(1)
  if (a instanceof Promise) return false
  const b = syncRead(String(a))
  if (b instanceof Promise) return false
  const c = syncRead([b as string])
  if (c instanceof Promise) return false
  return (c as string[])[0] === '1'
}

// ── SHAPE 21: boundary wrapped in another function ────────────────
function t_wrapped_in_closure({ syncRead }: Boundary) {
  const wrapped = () => syncRead('wrapped')
  const v = wrapped()
  return v === 'wrapped' && !(v instanceof Promise)
}

// ── SHAPE 22: Promise.resolve on the result ───────────────────────
async function t_promise_resolve_result({ syncRead }: Boundary) {
  const v = Promise.resolve(syncRead(7))
  return (await v) === 7
}

// ── SHAPE 23: .then called manually on result ─────────────────────
async function t_manual_then({ syncRead }: Boundary) {
  return new Promise<boolean>((resolve) => {
    const v = syncRead(11)
    Promise.resolve(v).then((resolved) => {
      resolve(resolved === 11)
    })
  })
}

// ── SHAPE 24: boundary inside Promise executor ────────────────────
function t_inside_promise_executor({ syncRead }: Boundary) {
  return new Promise<boolean>((resolve) => {
    const v = syncRead(13)
    resolve(!(v instanceof Promise) && v === 13)
  })
}

function THE_WEIRD_TEST_WELL_IT_WOULD_BE_CHEATING_IF_THIS_WORKED_LOL<T>(s: T, chain?: CHAIN) {
	let v: A = "string";
	if (v !== undefined && !(v instanceof Promise)) {
		return MaybePromise(v);
	} else {
		const timeoutMs = 50000;
		return MaybePromise(
			(() => {
			return	new Promise<T>((resolve, reject) => {
					let timer: RET<typeof setTimeout> | UD;
					if (v) {
						if (timer) clearTimeout(timer);
						resolve(v as T);
						return;
					}
					if (timeoutMs) {
						timer = setTimeout(() => {
							reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`));
						}, timeoutMs);
					}
				});
			})(),
		);
	}
}
function two<T>(s: T, chain?: CHAIN) {
let v: A = Promise.resolve("string") as A;
	if (v !== undefined && !(v instanceof Promise)) {
		return MaybePromise(v );
	} else {
		const timeoutMs = 50000;
		return MaybePromise(
			(() => {
			return	new Promise<T>((resolve, reject) => {
					let timer: RET<typeof setTimeout> | UD;
					if (v) {
						if (timer) clearTimeout(timer);
						resolve(v as T);
						return;
					}
					if (timeoutMs) {
						timer = setTimeout(() => {
							reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`));
						}, timeoutMs);
					}
				});
			})(),
		);
	}
}
function three<T>(s: T, chain?: CHAIN) {
let v: A = new Promise<T>((resolve) => {
	setTimeout(() => resolve("string" as T), 100);
}) as A;
	if (v !== undefined && !(v instanceof Promise)) {
		return MaybePromise(v );
	} else {
		const timeoutMs = 50000;
		return MaybePromise(
			(() => {
			return	new Promise<T>((resolve, reject) => {
					let timer: RET<typeof setTimeout> | UD;
					if (v) {
						if (timer) clearTimeout(timer);
						resolve(v as T);
						return;
					}
					if (timeoutMs) {
						timer = setTimeout(() => {
							reject(new Error(`[rift] wait() timed out after ${timeoutMs}ms`));
						}, timeoutMs);
					}
				});
			})(),
		);
	}
}
// #endregion 🢀
// RUNNER — pile everything into one themed log
// #region ══════════════════════════════════════════════════════════════════════════════════════════════════

const assertions: [string, (b: Boundary) => boolean | Promise<boolean>][] = [
  ['falsy stays sync', a_falsy_stays_sync],
  ['undefined goes async', a_undefined_goes_async],
  ['null stays sync', a_null_stays_sync],
  ['promise passes through', a_promise_passes_through],
  ['identity preserved', a_identity_preserved],
  ['deep sync chain', a_deep_sync_chain],
  ['undefined round-trips', a_undefined_round_trips],
  ['asyncRead defined', a_async_read_defined],
  ['asyncRead undefined', a_async_read_undefined],
  ['asyncRead falsy', a_async_read_falsy],
  ['asyncRead returns promise', a_async_read_returns_promise],
  ['sync value awaitable', a_sync_value_awaitable],
  ['thenable passes through', a_thenable_passes_through],
  ['sync feeds async', a_sync_feeds_async],
  ['async feeds sync post-await', a_async_feeds_sync],
  ['async feeds sync pre-await', a_async_feeds_sync_as_promise],
  // ── new shapes ──
  ['sync direct use', t_sync_direct_use],
  ['async direct use', t_async_direct_use],
  ['deferred await', t_deferred_await],
  ['promise all', t_promise_all],
  ['recursive boundary', t_recursive_boundary],
  ['fire and forget', t_fire_and_forget],
  ['promise input identity', t_promise_input_identity],
  ['thenable input identity', t_thenable_input_identity],
  ['callable thenable', t_callable_thenable],
  ['iterable use', t_iterable_use],
  ['destructure result', t_destructure_result],
  ['method call', t_method_call],
  ['undefined is promise', t_undefined_is_promise],
  ['null is not promise', t_null_is_not_promise],
  ['sync path no microtask', t_sync_path_no_microtask],
  ['inside try catch', t_inside_try_catch],
  ['stored in map', t_stored_in_map],
  ['passed as arg', t_passed_as_arg],
  ['switch on result', t_switch_on_result],
  ['nested mixed types', t_nested_mixed_types],
  ['wrapped in closure', t_wrapped_in_closure],
  ['promise resolve result', t_promise_resolve_result],
  ['manual then', t_manual_then],
  ['inside promise executor', t_inside_promise_executor],

  ['template literal', t_template_literal],
  ['numeric arithmetic', t_numeric_arithmetic],
  ['boolean condition', t_boolean_condition],
  ['spread into array', t_spread_into_array],
  ['spread into object', t_spread_into_object],
  ['result as map key', t_result_as_map_key],
  ['array destructure', t_array_destructure],
  ['json roundtrip', t_json_roundtrip],
  ['optional chaining', t_optional_chaining],
  ['nullish coalescing', t_nullish_coalescing],
  ['logical and', t_logical_and],
  ['logical or', t_logical_or],
  ['array is array', t_array_is_array],
  ['typeof check', t_typeof_check],
  ['instanceof check', t_instanceof_check],
  ['ternary on result', t_ternary_on_result],
  ['object is', t_object_is],
  ['strict eq null', t_strict_eq_null],
  ['loose eq undefined', t_loose_eq_undefined],
  ['while loop', t_while_loop],
  ['for loop', t_for_loop],
  ['reduce', t_reduce],
  ['map method', t_map_method],
  ['filter method', t_filter_method],
  ['find method', t_find_method],
  ['includes method', t_includes_method],
  ['indexof method', t_indexof_method],
  ['object keys', t_object_keys],
  ['object values', t_object_values],
  ['object entries', t_object_entries],
  ['object assign', t_object_assign],
  ['object freeze', t_object_freeze],
  ['structured clone', t_structured_clone],
  ['stored in set', t_stored_in_set],
  ['stored in weakmap', t_stored_in_weakmap],
  ['symbol key', t_symbol_key],
  ['function argument', t_function_argument],
  ['returned from inner', t_returned_from_inner],
  ['promise constructor', t_promise_constructor],
  ['compare two reads', t_compare_two_reads],
  ['Working w/ single v => string', THE_WEIRD_TEST_WELL_IT_WOULD_BE_CHEATING_IF_THIS_WORKED_LOL],
  ['Working w/ single v => resolved promise', two],
  ['Working w/ single v => unresolved promise', three],



]

async function runVariant(name: string, boundary: Boundary) {
  const results: [string, boolean, string?][] = []
  for (const [assertName, fn] of assertions) {
    try {
      const pass = await fn(boundary)
      results.push([assertName, pass])
    } catch (e: any) {
      results.push([assertName, false, e?.message ?? String(e)])
    }
  }
  return { name, results }
}
async function dos_all() {
  const variants = [
    ['MaybeNakedPromise_2', B_666],
    ['MaybeNakedPromise_1', B_66],
    ['MaybeNakedPromise_main', B_6],

    ['MaybePromiseNotNull', B_41],
    ['MaybePromiseNotNull_1', B_23],
    ['MaybePromiseNotNull_main', B_3],

    ['MaybePromiseCheat_2', B_22],
    ['MaybePromiseCheat_1', B_21],
    ['MaybePromiseCheat_main', B_13],

    ['MaybePromise_2', B_12],
    ['MaybePromise_1', B_11],
    ['MaybePromise_main', B_main],
  ] as const


  const out: Record<string, any> = {}
  for (const [name, boundary] of variants) {
    const { results } = await runVariant(name, boundary)
    const passed = results.filter(r => r[1]).length
    const failed = results.filter(r => !r[1])
    out[name] = {
      score: `${passed}/${results.length}`,
      failed: failed.length
        ? Object.fromEntries(failed.map(([n, , err]) => [n, err ?? 'FAIL']))
        : 'ALL PASS',
    }
  }
  return out
}
dos_all().then(matrix => {
  log(`[THE_CLOUD][DOS_TEST][MAYBE_PROMISE_VARIANTS]`, {
    variants: matrix,
    total_assertions: assertions.length,
    variant_count: Object.keys(matrix).length,
  }, t.deep)
})
async function probe(label: string, fn: () => any) {
  const out = fn()
  const isPromise = out instanceof Promise
  log(`[DOS] ${label}`, {
    returned: isPromise ? 'Promise' : typeof out,
    is_promise: isPromise,
    value_if_sync: isPromise ? undefined : String(out),
    resolves_to: isPromise ? String(await out) : undefined,
  }, isPromise ? t.info : t.success)
}
// #endregion 🢀








