import Web3 from 'web3';
import { Address, Pair } from "../pair";
import { Registry } from "../registry";
export declare class RegistryBalancer extends Registry {
    private web3;
    private registry;
    constructor(name: string, web3: Web3, registryAddr: Address);
    findPairs: (tokenWhitelist: Address[]) => Promise<Pair[]>;
}
