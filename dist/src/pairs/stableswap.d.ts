import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Address, Pair, Snapshot, BigNumberString } from "../pair";
interface PairStableSwapSnapshot extends Snapshot {
    paused: boolean;
    tokenPrecisionMultipliers: BigNumberString[];
    balancesWithAdjustedPrecision: BigNumberString[];
    swapFee: BigNumberString;
    preciseA: BigNumberString;
}
export declare class PairStableSwap extends Pair {
    private web3;
    private swapPoolAddr;
    allowRepeats: boolean;
    private swapPool;
    private paused;
    private tokenPrecisionMultipliers;
    private balancesWithAdjustedPrecision;
    private swapFee;
    private preciseA;
    static readonly POOL_PRECISION_DECIMALS = 18;
    static readonly A_PRECISION = 100;
    constructor(chainId: number, web3: Web3, swapPoolAddr: Address);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    private getY;
    private getD;
    protected swapExtraData(): string;
    snapshot(): PairStableSwapSnapshot;
    restore(snapshot: PairStableSwapSnapshot): void;
}
export {};
