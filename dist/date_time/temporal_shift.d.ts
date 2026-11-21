export declare function parse(input: string | number | Date, tz?: string): Date; /** Non-throwing variant of parse(). Returns null instead of throwing on bad input. */
export declare function tryParse(input: string | number | Date, tz?: string): Date | null;
export declare function format(date: Date, template: string): string; /** Like format(), but reads the date with UTC getters — pair with toTZ()'s output. */
export declare function formatInTZ(date: Date, template: string, tz: string): string;
export declare function add(date: Date, amount: number, unit: Unit): Date;
export declare function sub(date: Date, amount: number, unit: Unit): Date;
export declare function diff(a: Date, b: Date, unit: Unit): number;
export declare function startOf(date: Date, unit: Density): Date;
export declare function endOf(date: Date, unit: Density): Date;
export declare function tzOffset(tz: string, date?: Date): number; /** Shift `date` so its UTC getters read as wall-clock time in `tz`. Read with getUTC*() only. */
export declare function toTZ(date: Date, tz: string): Date; /** Inverse of toTZ: given a Date whose UTC fields are a wall-clock time meant for `tz`, return the real instant. */
export declare function fromTZ(date: Date, tz: string): Date;
export declare function localTZ(): string;
export declare function overlaps(a: Range, b: Range): boolean;
export declare function getOverlap(a: Range, b: Range): Range | null;
export declare function findConflicts(events: Range[]): Conflict[];
export declare function isDateInRange(date: Date, range: Range): boolean;
export declare function relative(date: Date, from?: Date): string;
export declare function parseNatural(input: string, from?: Date): Date;
export declare function tryParseNatural(input: string, from?: Date): Date | null;
export declare function expandRecurring(event: RecurringEvent, viewStart: Date, viewEnd: Date): Range[];
export declare function weekLoad(events: Range[], weekStart: Date): number;
export declare function snapToSlot(date: Date, minutes: number): Date;
export declare function durationLabel(ms: number): string;
export declare function isTravelDay(eventA: Range & {
    city?: string;
}, eventB: Range & {
    city?: string;
}): boolean;
export declare function isSameDay(a: Date, b: Date): boolean;
export declare function isSameWeek(a: Date, b: Date): boolean;
export declare function isSameMonth(a: Date, b: Date): boolean;
export declare function isSameHour(a: Date, b: Date): boolean;
export declare function isSameMinute(a: Date, b: Date): boolean;
export declare function isWeekend(date: Date): boolean;
export declare function isLeapYear(year: number): boolean;
export declare function daysInMonth(year: number, month: number): number;
export declare function clamp(date: Date, min: Date, max: Date): Date;
export declare function startOfDay(d: Date): Date;
export declare function startOfMonth(d: Date): Date;
export declare function endOfMonth(d: Date): Date;
export declare function startOfWeek(d: Date, weekStartsOn: number): Date;
export declare function addDays(d: Date, n: number): Date;
export declare function addMonths(d: Date, n: number): Date;
export declare function subMonths(d: Date, n: number): Date;
export declare function diffDays(a: Date, b: Date): number;
export declare function getDaysBetween(a: Date, b: Date): number;
export declare function getWeekNumber(d: Date): number;
export declare function getWeekOfMonth(date: Date, weekStartsOn?: number): number;
export declare function getDaysInWeek(date: Date, weekStartsOn?: number): Date[];
export declare function getMonthName(date: Date, locale?: string, format?: 'long' | 'short'): string;
export declare function getDayName(date: Date, locale?: string, format?: 'long' | 'short'): string;
export declare function getWeekDays(weekStartsOn: number, locale: string): string[];
export declare function getQuarter(date: Date): number;
export declare function quarterStart(year: number, quarter: number): Date;
export declare function quarterEnd(year: number, quarter: number): Date;
export declare function getLocaleWeekStart(): number;
export declare function parseISO(str: string): Date;
export declare function formatISO(date: Date, opts?: {
    dateOnly?: boolean;
}): string;
export declare function toLocalString(date: Date, opts?: Intl.DateTimeFormatOptions, locale?: string): string;
export declare function matchesDisabled(d: Date, matcher?: DateMatcher): boolean;
export declare function getMonthGrid(month: Date, weekStartsOn: number, fixedWeeks: boolean): Date[][];
export declare function sortDates(dates: Date[], order?: 'asc' | 'desc'): Date[];
export declare function resolveSelection(date: Date, mode: Mode, current: any, min?: number, max?: number, excludeDisabled?: boolean, disabled?: DateMatcher): any;
export declare function isDaySelected(date: Date, mode: Mode, selected: any): boolean;
export declare function isRangeStart(date: Date, mode: Mode, selected: any): boolean;
export declare function isRangeEnd(date: Date, mode: Mode, selected: any): boolean;
export declare function isRangeMiddle(date: Date, mode: Mode, selected: any): boolean;
export declare function defaultFormatters(locale: string): Formatters;
/** @deprecated use getMonthGrid(new Date(year, month, 1), weekStartsOn, true) — kept as a thin alias. */
export declare function buildMonth(year: number, month: number, weekStartsOn: number): Date[][];
/** @deprecated alias of matchesDisabled — kept for backward compatibility. */
export declare const isDateDisabled: typeof matchesDisabled;
export interface Range {
    start: Date;
    end: Date;
}
export interface RRuleOptions {
    freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    count?: number;
    until?: Date;
    byDay?: number[];
    byMonthDay?: number[];
}
export interface RecurringEvent extends Range {
    rrule: RRuleOptions;
}
export interface Conflict {
    a: Range;
    b: Range;
    overlap: Range;
}
interface Formatters {
    formatDay?: (date: Date) => string;
    formatWeekday?: (date: Date) => string;
    formatMonthCaption?: (date: Date) => string;
    formatYearCaption?: (date: Date) => string;
    formatWeekNumber?: (weekNumber: number) => string;
}
export type Unit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type Density = 'minute' | 'hour' | 'day' | 'week' | 'month';
export type Mode = 'single' | 'multi' | 'range' | 'range-min' | 'week' | 'quarter' | 'month' | 'year';
export interface Range {
    start: Date;
    end: Date;
}
export interface RRuleOptions {
    freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    count?: number;
    until?: Date;
    byDay?: number[];
    byMonthDay?: number[];
}
export interface RecurringEvent extends Range {
    rrule: RRuleOptions;
}
export interface Conflict {
    a: Range;
    b: Range;
    overlap: Range;
}
interface Formatters {
    formatDay?: (date: Date) => string;
    formatWeekday?: (date: Date) => string;
    formatMonthCaption?: (date: Date) => string;
    formatYearCaption?: (date: Date) => string;
    formatWeekNumber?: (weekNumber: number) => string;
}
export type DateMatcher = Date | {
    from: Date;
    to?: Date;
} | {
    before?: Date;
    after?: Date;
    dayOfWeek?: number[];
    dates?: Date[];
    fn?: (date: Date) => boolean;
} | ((date: Date) => boolean) | DateMatcher[];
export {};
