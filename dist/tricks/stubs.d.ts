type StubHit = {
    category: string;
    key: string;
    prop: string;
    location: any;
};
export declare const STUB_HITS: StubHit[];
export declare function isStub(value: any): boolean;
export declare function makeStub(trace?: {
    category: string;
    key: string;
    location: any;
}): any;
export declare function flushStubReport(): void;
export {};
