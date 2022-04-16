/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface IbPool extends Contract {
    clone(): IbPool;
    methods: {
        swapExactAmountIn(arg0: string, arg1: number | string, arg2: string, arg3: number | string, arg4: number | string): CeloTxObject<{
            0: string;
            1: string;
        }>;
        swapExactAmountOut(arg0: string, arg1: number | string, arg2: string, arg3: number | string, arg4: number | string): CeloTxObject<{
            0: string;
            1: string;
        }>;
        calcInGivenOut(arg0: number | string, arg1: number | string, arg2: number | string, arg3: number | string, arg4: number | string, arg5: number | string): CeloTxObject<string>;
        calcOutGivenIn(arg0: number | string, arg1: number | string, arg2: number | string, arg3: number | string, arg4: number | string, arg5: number | string): CeloTxObject<string>;
        getDenormalizedWeight(arg0: string): CeloTxObject<string>;
        getBalance(arg0: string): CeloTxObject<string>;
        getSwapFee(): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newIbPool(web3: Web3, address: string): IbPool;
