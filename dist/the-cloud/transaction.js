// sauron/transaction.ts
let activeTx = null;
export function beginTx() {
    const journal = [];
    const previous = activeTx;
    activeTx = journal;
    return journal;
}
export function commitTx() {
    activeTx = null;
}
export function rollbackTx(journal) {
    for (let i = journal.length - 1; i >= 0; i--) {
        journal[i]();
    }
    activeTx = null;
}
export function tx(fn) {
    const journal = beginTx();
    return batch(() => {
        try {
            const result = fn();
            commitTx();
            return result;
        }
        catch (error) {
            rollbackTx(journal);
            throw error;
        }
    });
}
