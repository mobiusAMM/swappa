import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Address, Pair, Snapshot, BigNumberString } from "../pair";
interface PairSymmetricSwapSnapshot extends Snapshot {
    paused: boolean;
    balanceA: BigNumberString;
    balanceB: BigNumberString;
}
export declare class PairSymmetricSwap extends Pair {
    private swapPoolAddr;
    tokenA: Address;
    tokenB: Address;
    allowRepeats: boolean;
    private swapPool;
    private paused;
    private ercA;
    private ercB;
    private balanceA;
    private balanceB;
    constructor(chainId: number, web3: Web3, swapPoolAddr: Address, tokenA: Address, tokenB: Address);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    protected swapExtraData(): string;
    snapshot(): PairSymmetricSwapSnapshot;
    restore(snapshot: PairSymmetricSwapSnapshot): void;
}
export {};
