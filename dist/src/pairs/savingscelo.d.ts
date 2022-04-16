import BigNumber from "bignumber.js";
import { ContractKit } from "@celo/contractkit";
import { Address, Pair, Snapshot, BigNumberString } from "../pair";
interface PairSavingsCELOSnapshot extends Snapshot {
    celoTotal: BigNumberString;
    savingsTotal: BigNumberString;
}
export declare class PairSavingsCELO extends Pair {
    private kit;
    allowRepeats: boolean;
    private savingsKit;
    private totalSupplies?;
    constructor(chainId: number, kit: ContractKit, savingsCELOAddr: Address);
    protected _init(): Promise<{
        pairKey: null;
        tokenA: string;
        tokenB: string;
    }>;
    refresh(): Promise<void>;
    protected swapExtraData(inputToken: Address): string;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    snapshot(): PairSavingsCELOSnapshot;
    restore(snapshot: PairSavingsCELOSnapshot): void;
}
export {};
