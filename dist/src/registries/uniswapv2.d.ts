import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Address, Pair } from "../pair";
import { Registry } from "../registry";
export declare class RegistryUniswapV2 extends Registry {
    private web3;
    private opts?;
    private factory;
    constructor(name: string, web3: Web3, factoryAddr: Address, opts?: {
        fixedFee?: BigNumber | undefined;
        fetchUsingAllPairs?: boolean | undefined;
    } | undefined);
    findPairs: (tokenWhitelist: Address[]) => Promise<Pair[]>;
}
