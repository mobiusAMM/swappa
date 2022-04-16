/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ILendingPool extends Contract {
    clone(): ILendingPool;
    methods: {
        getReserveData(_reserve: string): CeloTxObject<{
            totalLiquidity: string;
            availableLiquidity: string;
            totalBorrowsStable: string;
            totalBorrowsVariable: string;
            liquidityRate: string;
            variableBorrowRate: string;
            stableBorrowRate: string;
            averageStableBorrowRate: string;
            utilizationRate: string;
            liquidityIndex: string;
            variableBorrowIndex: string;
            aTokenAddress: string;
            lastUpdateTimestamp: string;
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            6: string;
            7: string;
            8: string;
            9: string;
            10: string;
            11: string;
            12: string;
        }>;
        getReserves(): CeloTxObject<string[]>;
        deposit(_reserve: string, _amount: number | string, _referralCode: number | string): CeloTxObject<void>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newILendingPool(web3: Web3, address: string): ILendingPool;
