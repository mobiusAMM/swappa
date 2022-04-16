import { Address, Pair } from "../pair";
import { Registry } from "../registry";
export declare class RegistryStatic extends Registry {
    private pairsAll;
    constructor(name: string, pairsAll: Promise<Pair[]>);
    findPairs: (tokenWhitelist: Address[]) => Promise<Pair[]>;
}
