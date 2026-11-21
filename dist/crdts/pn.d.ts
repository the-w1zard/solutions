/**
// PN-Counter — e.g. a like count multiple clients increment/decrement independently
const likes = new PN_COUNTER(staff.instanceId, hlc);
likes.increment();
likes.increment(3);
likes.decrement();
console.log(likes.value()); // 3

// broadcast + merge over the bus, same shape as fuseSignal's persistence wiring
staff.multisub('[COUNTERS]', 'post:42:likes', (state: PNCounterState) => likes.merge(state));
const unsub = () => staff.sendsub('[COUNTERS]', 'post:42:likes', likes.delta());
likes.increment(); unsub(); // broadcast only this replica's own slot, not the whole vector

// OR-Set — e.g. collaboratively edited tag list
const tags = new OR_SET<string>(staff.instanceId, hlc);
tags.add('urgent');
tags.add('bug');
tags.remove('bug');
console.log(tags.values()); // ['urgent']

staff.multisub('[TAGS]', 'post:42', (state: ORSetState<string>) => tags.merge(state));
staff.sendsub('[TAGS]', 'post:42', tags.getState());

// LWW-Register — e.g. a single "status" field multiple agents might set concurrently
const status = new LWW_REGISTER<'pending' | 'claimed' | 'done'>(staff.instanceId, hlc, 'pending');
status.set('claimed');
console.log(status.get()); // 'claimed'

staff.multisub('[TASK_STATUS]', 'task:7', (state: LWWState<string>) => status.merge(state));
staff.sendsub('[TASK_STATUS]', 'task:7', status.getState());
 */
export interface PNCounterState {
    positive: Record<string, number>;
    negative: Record<string, number>;
}
export declare class PN_COUNTER {
    private readonly nodeId;
    private positive;
    private negative;
    constructor(nodeId: string);
    increment(amount?: number): void;
    decrement(amount?: number): void;
    value(): number;
    /** Element-wise max merge — this is what makes concurrent increments
     * conflict-free: each node only ever grows its own slot, merge never loses
     * a contribution regardless of what order states arrive in. */
    merge(other: PN_COUNTER | PNCounterState): void;
    getState(): PNCounterState;
    setState(state: PNCounterState): void;
    /** Only this replica's own slot — sufficient for merge() on the receiving
     * end (max() with an unrelated node's existing value is a no-op), and far
     * smaller than getState() once many nodes have contributed over time. This
     * is the delta-state escape hatch from the gap analysis — not a generic
     * DIFFPATCH integration, since the whole state here is already just two
     * flat node->number maps; diffing that would add overhead, not save it. */
    delta(): PNCounterState;
}
