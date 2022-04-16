import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Address, Pair, Snapshot, BigNumberString } from "../pair";
interface PairOpenSumSwapSnapshot extends Snapshot {
    paused: boolean;
    balances: BigNumberString[];
}
export declare class PairOpenSumSwap extends Pair {
    private swapPoolAddr;
    allowRepeats: boolean;
    private swapPool;
    private paused;
    private balances;
    constructor(chainId: number, web3: Web3, swapPoolAddr: Address);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    protected swapExtraData(): string;
    snapshot(): PairOpenSumSwapSnapshot;
    restore(snapshot: PairOpenSumSwapSnapshot): void;
}
export {};
