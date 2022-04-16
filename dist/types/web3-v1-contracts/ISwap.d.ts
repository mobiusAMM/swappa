/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ISwap extends Contract {
    clone(): ISwap;
    methods: {
        paused(): CeloTxObject<boolean>;
        getToken(index: number | string): CeloTxObject<string>;
        getBalances(): CeloTxObject<string[]>;
        getSwapFee(): CeloTxObject<string>;
        getAPrecise(): CeloTxObject<string>;
        swap(tokenIndexFrom: number | string, tokenIndexTo: number | string, dx: number | string, minDy: number | string, deadline: number | string): CeloTxObject<string>;
        calculateSwap(tokenIndexFrom: number | string, tokenIndexTo: number | string, dx: number | string): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newISwap(web3: Web3, address: string): ISwap;
