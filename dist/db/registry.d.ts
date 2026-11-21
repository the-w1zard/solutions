import { type SauronState } from "./state.js";
export declare function createRegistry(name?: string): SauronState & {
    name: string;
    destroy(): void;
};
export declare function getRegistry(name: string): any;
export declare function getAllRegistries(): any;
export declare function getGR(label: string, registry: string): unknown;
