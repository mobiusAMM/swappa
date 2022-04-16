import { ContractKit } from "@celo/contractkit";
import { Address } from "../pair";
import { Registry } from "../registry";
export declare class RegistryMento extends Registry {
    private kit;
    constructor(kit: ContractKit);
    findPairs: (tokenWhitelist: Address[]) => Promise<import("../pair").Pair[]>;
}
