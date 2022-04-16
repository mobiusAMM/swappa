import { CeloTransactionObject } from "@celo/connect";
import { ContractKit } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import { Address, Pair } from "./pair";
import { Registry } from "./registry";
import { Route, RouterOpts } from "./router";
export declare class SwappaManager {
    private kit;
    readonly routerAddr: Address;
    private registries;
    private pairs;
    private pairsByToken;
    private pairsByRegistry;
    constructor(kit: ContractKit, routerAddr: Address, registries: Registry[]);
    reinitializePairs: (tokenWhitelist: Address[]) => Promise<Pair[]>;
    refreshPairs: () => Promise<Pair[]>;
    findBestRoutesForFixedInputAmount: (inputToken: Address, outputToken: Address, inputAmount: BigNumber, opts?: RouterOpts | undefined) => Route[];
    swap: (route: {
        pairs: Pair[];
        path: Address[];
    }, inputAmount: BigNumber, minOutputAmount: BigNumber, to: Address, opts?: {
        precheckOutputAmount?: boolean | undefined;
        deadlineMs?: number | undefined;
    } | undefined) => CeloTransactionObject<unknown>;
    getPairsByRegistry(registry: string): Pair[];
}
export declare const swapTX: (kit: ContractKit, routerAddr: Address, route: {
    pairs: Pair[];
    path: Address[];
}, inputAmount: BigNumber, minOutputAmount: BigNumber, to: Address, opts?: {
    precheckOutputAmount?: boolean | undefined;
    deadlineMs?: number | undefined;
} | undefined) => CeloTransactionObject<unknown>;
