/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ISwappaRouterV1 extends Contract {
    clone(): ISwappaRouterV1;
    methods: {
        getOutputAmount(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string): CeloTxObject<string>;
        swapExactInputForOutput(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string, minOutputAmount: number | string, to: string, deadline: number | string): CeloTxObject<string>;
        swapExactInputForOutputWithPrecheck(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string, minOutputAmount: number | string, to: string, deadline: number | string): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newISwappaRouterV1(web3: Web3, address: string): ISwappaRouterV1;
