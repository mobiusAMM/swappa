import BigNumber from "bignumber.js";
import { Address, Pair } from "./pair";
export interface Route {
    pairs: Pair[];
    path: Address[];
    pathAmounts: BigNumber[];
    outputToken: Address;
    outputAmount: BigNumber;
}
export interface RouterOpts {
    maxSwaps?: number;
}
export declare const findBestRoutesForFixedInputAmount: (pairsByToken: Map<Address, Pair[]>, inputToken: Address, outputToken: Address, inputAmount: BigNumber, opts?: RouterOpts | undefined) => Route[];
