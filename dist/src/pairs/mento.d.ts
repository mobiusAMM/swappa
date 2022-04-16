import { ContractKit, StableToken } from "@celo/contractkit";
import { PairXYeqK } from "../pair";
export declare class PairMento extends PairXYeqK {
    private kit;
    private stableToken;
    allowRepeats: boolean;
    private exchange?;
    private reserve?;
    private sortedOracles?;
    constructor(chainId: number, kit: ContractKit, stableToken: StableToken);
    protected _init(): Promise<{
        pairKey: string;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    private mentoBucketsAfterUpdate;
    protected swapExtraData(): string;
}
