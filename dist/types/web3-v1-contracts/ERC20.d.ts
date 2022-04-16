/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { ContractEvent, EventOptions } from "./types";
export interface Erc20 extends Contract {
    clone(): Erc20;
    methods: {
        name(): CeloTxObject<string>;
        symbol(): CeloTxObject<string>;
        decimals(): CeloTxObject<string>;
        totalSupply(): CeloTxObject<string>;
        balanceOf(account: string): CeloTxObject<string>;
        transfer(recipient: string, amount: number | string): CeloTxObject<boolean>;
        allowance(owner: string, spender: string): CeloTxObject<string>;
        approve(spender: string, amount: number | string): CeloTxObject<boolean>;
        transferFrom(sender: string, recipient: string, amount: number | string): CeloTxObject<boolean>;
        increaseAllowance(spender: string, addedValue: number | string): CeloTxObject<boolean>;
        decreaseAllowance(spender: string, subtractedValue: number | string): CeloTxObject<boolean>;
    };
    events: {
        Approval: ContractEvent<{
            owner: string;
            spender: string;
            value: string;
            0: string;
            1: string;
            2: string;
        }>;
        Transfer: ContractEvent<{
            from: string;
            to: string;
            value: string;
            0: string;
            1: string;
            2: string;
        }>;
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newErc20(web3: Web3, address: string): Erc20;
