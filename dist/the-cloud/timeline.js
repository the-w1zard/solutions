// sauron/timeline.ts
export class Timeline {
    entries = [];
    index = -1;
    replaying = false;
    record(entry) {
        if (this.replaying)
            return;
        this.entries.splice(this.index + 1);
        this.entries.push({ id: crypto.randomUUID(), ...entry });
        if (this.entries.length > 1000) {
            this.entries.shift();
        }
        else {
            this.index++;
        }
    }
    back(steps = 1) {
        return this.goto(this.index - steps);
    }
    forward(steps = 1) {
        return this.goto(this.index + steps);
    }
    goto(target) {
        if (target < 0 || target >= this.entries.length)
            return false;
        if (target === this.index)
            return false;
        const direction = target > this.index ? 1 : -1;
        this.replaying = true;
        try {
            while (this.index !== target) {
                this.index += direction;
                const entry = this.entries[this.index];
                if (direction === 1) {
                    entry.key.write?.(entry.next);
                }
                else {
                    entry.key.write?.(entry.previous);
                }
            }
            return true;
        }
        finally {
            this.replaying = false;
        }
    }
    causalChain(key) {
        return this.entries.filter((entry) => entry.key === key);
    }
}
