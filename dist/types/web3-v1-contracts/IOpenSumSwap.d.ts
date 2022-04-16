/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface IOpenSumSwap extends Contract {
    clone(): IOpenSumSwap;
    methods: {
        paused(): CeloTxObject<boolean>;
        getToken(index: number | string): CeloTxObject<string>;
        getBalances(): CeloTxObject<string[]>;
        swap(tokenFrom: string, tokenTo: string, amountIn: number | string, minAmountOut: number | string, deadline: number | string): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newIOpenSumSwap(web3: Web3, address: string): IOpenSumSwap;
