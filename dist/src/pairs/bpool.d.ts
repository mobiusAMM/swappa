import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Address, Pair, Snapshot, BigNumberString } from "../pair";
interface PairBPoolSnapshot extends Snapshot {
    balanceA: BigNumberString;
    balanceB: BigNumberString;
}
export declare class PairBPool extends Pair {
    private poolAddr;
    tokenA: Address;
    tokenB: Address;
    allowRepeats: boolean;
    private bPool;
    private swapFee;
    private weightA;
    private weightB;
    private balanceA;
    private balanceB;
    constructor(chainId: number, web3: Web3, poolAddr: Address, tokenA: Address, tokenB: Address);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    protected swapExtraData(): string;
    snapshot(): PairBPoolSnapshot;
    restore(snapshot: PairBPoolSnapshot): void;
}
export {};
