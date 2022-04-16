import BigNumber from "bignumber.js";
import { ContractKit } from "@celo/contractkit";
import { Address, Pair, Snapshot } from "../pair";
export declare const ReserveCELO = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export declare class PairAToken extends Pair {
    private kit;
    private providerAddr;
    private reserve;
    allowRepeats: boolean;
    private provider;
    constructor(chainId: number, kit: ContractKit, providerAddr: Address, reserve: Address);
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
