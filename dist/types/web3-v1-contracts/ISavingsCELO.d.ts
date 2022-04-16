/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ISavingsCelo extends Contract {
    clone(): ISavingsCelo;
    methods: {
        deposit(): CeloTxObject<string>;
        celoToSavings(celoAmount: number | string): CeloTxObject<string>;
        savingsToCELO(savingsAmount: number | string): CeloTxObject<string>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newISavingsCelo(web3: Web3, address: string): ISavingsCelo;
