/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { ContractEvent, EventOptions } from "./types";
export interface SwappaRouterV1 extends Contract {
    clone(): SwappaRouterV1;
    methods: {
        getOutputAmount(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string): CeloTxObject<string>;
        swapExactInputForOutput(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string, minOutputAmount: number | string, to: string, deadline: number | string): CeloTxObject<string>;
        swapExactInputForOutputWithPrecheck(path: string[], pairs: string[], extras: (string | number[])[], inputAmount: number | string, minOutputAmount: number | string, to: string, deadline: number | string): CeloTxObject<string>;
    };
    events: {
        Swap: ContractEvent<{
            sender: string;
            to: string;
            input: string;
            output: string;
            inputAmount: string;
            outputAmount: string;
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
        }>;
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newSwappaRouterV1(web3: Web3, address: string): SwappaRouterV1;
