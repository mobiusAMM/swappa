/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { ContractEvent, EventOptions } from "./types";
export interface IbRegistry extends Contract {
    clone(): IbRegistry;
    methods: {
        getPairInfo(pool: string, fromToken: string, destToken: string): CeloTxObject<{
            weight1: string;
            weight2: string;
            swapFee: string;
            0: string;
            1: string;
            2: string;
        }>;
        getPoolsWithLimit(fromToken: string, destToken: string, offset: number | string, limit: number | string): CeloTxObject<string[]>;
        getBestPools(fromToken: string, destToken: string): CeloTxObject<string[]>;
        getBestPoolsWithLimit(fromToken: string, destToken: string, limit: number | string): CeloTxObject<string[]>;
        addPoolPair(pool: string, token1: string, token2: string): CeloTxObject<string>;
        addPools(pools: string[], token1: string, token2: string): CeloTxObject<string[]>;
        sortPools(tokens: string[], lengthLimit: number | string): CeloTxObject<void>;
        sortPoolsWithPurge(tokens: string[], lengthLimit: number | string): CeloTxObject<void>;
    };
    events: {
        IndicesUpdated: ContractEvent<{
            token1: string;
            token2: string;
            oldIndices: string;
            newIndices: string;
            0: string;
            1: string;
            2: string;
            3: string;
        }>;
        PoolTokenPairAdded: ContractEvent<{
            pool: string;
            token1: string;
            token2: string;
            0: string;
            1: string;
            2: string;
        }>;
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newIbRegistry(web3: Web3, address: string): IbRegistry;
