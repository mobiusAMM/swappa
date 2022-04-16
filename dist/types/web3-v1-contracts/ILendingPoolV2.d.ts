/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ILendingPoolV2 extends Contract {
    clone(): ILendingPoolV2;
    methods: {
        withdraw(asset: string, amount: number | string, to: string): CeloTxObject<string>;
        deposit(asset: string, amount: number | string, onBehalfOf: string, referralCode: number | string): CeloTxObject<void>;
        getReservesList(): CeloTxObject<string[]>;
        getReserveData(asset: string): CeloTxObject<{
            configuration: {
                data: string;
            };
            liquidityIndex: string;
            variableBorrowIndex: string;
            currentLiquidityRate: string;
            currentVariableBorrowRate: string;
            currentStableBorrowRate: string;
            lastUpdateTimestamp: string;
            aTokenAddress: string;
            stableDebtTokenAddress: string;
            variableDebtTokenAddress: string;
            interestRateStrategyAddress: string;
            id: string;
        }>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newILendingPoolV2(web3: Web3, address: string): ILendingPoolV2;
