import { ContractKit } from "@celo/contractkit";
import { Address } from "../pair";
import { Registry } from "../registry";
export declare class RegistryAave extends Registry {
    private kit;
    private lendingPoolAddrProvider;
    constructor(name: string, kit: ContractKit, lendingPoolAddrProviderAddr: string);
    findPairs: (tokenWhitelist: Address[]) => Promise<import("../pair").Pair[]>;
}
