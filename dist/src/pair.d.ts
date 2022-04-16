import BigNumber from "bignumber.js";
export declare type Address = string;
export declare abstract class Snapshot {
}
export declare type BigNumberString = string;
export interface SwapData {
    addr: string;
    extra: string;
}
export declare abstract class Pair {
    pairKey: string | null;
    tokenA: Address;
    tokenB: Address;
    private swappaPairAddress;
    constructor(swappaPairAddress: Address);
    init(): Promise<void>;
    protected abstract _init(): Promise<{
        pairKey: string | null;
        tokenA: Address;
        tokenB: Address;
    }>;
    abstract refresh(): Promise<void>;
    swapData(inputToken: Address): SwapData;
    protected abstract swapExtraData(inputToken: Address): string;
    abstract outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    abstract snapshot(): Snapshot;
    abstract restore(snapshot: Snapshot): void;
}
interface PairXYeqKSnapshot extends Snapshot {
    fee: BigNumberString;
    bucketA: BigNumberString;
    bucketB: BigNumberString;
}
export declare abstract class PairXYeqK extends Pair {
    private fee;
    private bucketA;
    private bucketB;
    refreshBuckets(fee: BigNumber, bucketA: BigNumber, bucketB: BigNumber): void;
    outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber;
    inputAmount(outputToken: Address, outputAmount: BigNumber): BigNumber;
    snapshot(): PairXYeqKSnapshot;
    restore(snapshot: PairXYeqKSnapshot): void;
}
export {};
