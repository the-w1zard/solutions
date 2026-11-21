type Undo = () => void;
export declare function beginTx(): Undo[];
export declare function commitTx(): void;
export declare function rollbackTx(journal: Undo[]): void;
export declare function tx<T>(fn: () => T): T;
export {};
