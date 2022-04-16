/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ILendingPoolAddressesProviderV2 extends Contract {
    clone(): ILendingPoolAddressesProviderV2;
    methods: {
        getLendingPool(): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newILendingPoolAddressesProviderV2(web3: Web3, address: string): ILendingPoolAddressesProviderV2;
