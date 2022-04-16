import Web3 from "web3";
import { Address } from "../pair";
import { Registry } from "../registry";
export declare class RegistryAaveV2 extends Registry {
    private web3;
    private provider;
    constructor(name: string, web3: Web3, lendingPoolAddrProviderAddr: string);
    findPairs: (tokenWhitelist: Address[]) => Promise<import("../pair").Pair[]>;
}
