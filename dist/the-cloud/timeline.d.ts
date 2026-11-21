export interface TimelineEntry<T> {
    id: string;
    scopeId: string | null;
    key: SignalKey;
    previous: T;
    next: T;
    source: string;
    cause?: string;
    timestamp: number;
    txId?: string;
}
export declare class Timeline {
    private entries;
    private index;
    private replaying;
    record<T>(entry: Omit<TimelineEntry<T>, 'id'>): void;
    back(steps?: number): boolean;
    forward(steps?: number): boolean;
    goto(target: number): boolean;
    causalChain(key: SignalKey): TimelineEntry<any>[];
}
