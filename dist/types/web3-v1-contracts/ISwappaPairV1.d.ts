/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ISwappaPairV1 extends Contract {
    clone(): ISwappaPairV1;
    methods: {
        swap(input: string, output: string, to: string, data: string | number[]): CeloTxObject<void>;
        getOutputAmount(input: string, output: string, amountIn: number | string, data: string | number[]): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newISwappaPairV1(web3: Web3, address: string): ISwappaPairV1;
