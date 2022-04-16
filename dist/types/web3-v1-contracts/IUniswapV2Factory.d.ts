/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { ContractEvent, EventOptions } from "./types";
export interface IUniswapV2Factory extends Contract {
    clone(): IUniswapV2Factory;
    methods: {
        feeTo(): CeloTxObject<string>;
        feeToSetter(): CeloTxObject<string>;
        getPair(tokenA: string, tokenB: string): CeloTxObject<string>;
        allPairs(arg0: number | string): CeloTxObject<string>;
        allPairsLength(): CeloTxObject<string>;
        createPair(tokenA: string, tokenB: string): CeloTxObject<string>;
        setFeeTo(arg0: string): CeloTxObject<void>;
        setFeeToSetter(arg0: string): CeloTxObject<void>;
    };
    events: {
        PairCreated: ContractEvent<{
            token0: string;
            token1: string;
            pair: string;
            0: string;
            1: string;
            2: string;
            3: string;
        }>;
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newIUniswapV2Factory(web3: Web3, address: string): IUniswapV2Factory;
