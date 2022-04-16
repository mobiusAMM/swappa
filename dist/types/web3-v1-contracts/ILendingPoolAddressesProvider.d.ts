/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { EventOptions } from "./types";
export interface ILendingPoolAddressesProvider extends Contract {
    clone(): ILendingPoolAddressesProvider;
    methods: {
        getLendingPool(): CeloTxObject<string>;
        setLendingPoolImpl(_pool: string): CeloTxObject<void>;
        getLendingPoolCore(): CeloTxObject<string>;
        setLendingPoolCoreImpl(_lendingPoolCore: string): CeloTxObject<void>;
        getLendingPoolConfigurator(): CeloTxObject<string>;
        setLendingPoolConfiguratorImpl(_configurator: string): CeloTxObject<void>;
        getLendingPoolDataProvider(): CeloTxObject<string>;
        setLendingPoolDataProviderImpl(_provider: string): CeloTxObject<void>;
        getLendingPoolParametersProvider(): CeloTxObject<string>;
        setLendingPoolParametersProviderImpl(_parametersProvider: string): CeloTxObject<void>;
        getTokenDistributor(): CeloTxObject<string>;
        setTokenDistributor(_tokenDistributor: string): CeloTxObject<void>;
        getFeeProvider(): CeloTxObject<string>;
        setFeeProviderImpl(_feeProvider: string): CeloTxObject<void>;
        getLendingPoolLiquidationManager(): CeloTxObject<string>;
        setLendingPoolLiquidationManager(_manager: string): CeloTxObject<void>;
        getLendingPoolManager(): CeloTxObject<string>;
        setLendingPoolManager(_lendingPoolManager: string): CeloTxObject<void>;
        getPriceOracle(): CeloTxObject<string>;
        setPriceOracle(_priceOracle: string): CeloTxObject<void>;
        getLendingRateOracle(): CeloTxObject<string>;
        setLendingRateOracle(_lendingRateOracle: string): CeloTxObject<void>;
    };
    events: {
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter;
    };
}
export declare const ABI: AbiItem[];
export declare function newILendingPoolAddressesProvider(web3: Web3, address: string): ILendingPoolAddressesProvider;
