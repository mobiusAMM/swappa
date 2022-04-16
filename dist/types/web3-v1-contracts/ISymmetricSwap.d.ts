/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ISymmetricSwap extends Contract {
    clone(): ISymmetricSwap;
    methods: {
        paused(): CeloTxObject<boolean>;
        swap(from: string, to: string, amount: number | string): CeloTxObject<void>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newISymmetricSwap(web3: Web3, address: string): ISymmetricSwap;
