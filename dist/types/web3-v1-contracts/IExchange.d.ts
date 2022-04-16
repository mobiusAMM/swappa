/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface IExchange extends Contract {
    clone(): IExchange;
    methods: {
        stable(): CeloTxObject<string>;
        sell(sellAmount: number | string, minBuyAmount: number | string, sellGold: boolean): CeloTxObject<string>;
        getBuyTokenAmount(sellAmount: number | string, sellGold: boolean): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newIExchange(web3: Web3, address: string): IExchange;
