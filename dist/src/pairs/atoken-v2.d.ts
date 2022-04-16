import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Address, Pair, Snapshot } from "../pair";
export declare class PairATokenV2 extends Pair {
    private web3;
    private poolAddr;
    private reserve;
    allowRepeats: boolean;
    private pool;
    constructor(chainId: number, web3: Web3, poolAddr: Address, reserve: Address);
    protected _init(): Promise<{
        pairKey: null;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    protected swapExtraData(inputToken: Address): string;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    snapshot(): Snapshot;
    restore(snapshot: Snapshot): void;
}
