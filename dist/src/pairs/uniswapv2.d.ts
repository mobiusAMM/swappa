import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Address, PairXYeqK } from "../pair";
export declare class PairUniswapV2 extends PairXYeqK {
    private web3;
    private pairAddr;
    private fixedFee;
    allowRepeats: boolean;
    private pair;
    private feeKData;
    constructor(chainId: number, web3: Web3, pairAddr: Address, fixedFee?: BigNumber);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    protected swapExtraData(): string;
}
