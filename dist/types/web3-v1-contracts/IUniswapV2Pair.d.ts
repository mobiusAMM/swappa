/// <reference types="node" />
import { AbiItem, Callback, CeloTxObject, Contract, EventLog } from "@celo/connect";
import { EventEmitter } from "events";
import Web3 from "web3";
import { ContractEvent, EventOptions } from "./types";
export interface IUniswapV2Pair extends Contract {
    clone(): IUniswapV2Pair;
    methods: {
        name(): CeloTxObject<string>;
        symbol(): CeloTxObject<string>;
        decimals(): CeloTxObject<string>;
        totalSupply(): CeloTxObject<string>;
        balanceOf(owner: string): CeloTxObject<string>;
        allowance(owner: string, spender: string): CeloTxObject<string>;
        approve(spender: string, value: number | string): CeloTxObject<boolean>;
        transfer(to: string, value: number | string): CeloTxObject<boolean>;
        transferFrom(from: string, to: string, value: number | string): CeloTxObject<boolean>;
        DOMAIN_SEPARATOR(): CeloTxObject<string>;
        PERMIT_TYPEHASH(): CeloTxObject<string>;
        nonces(owner: string): CeloTxObject<string>;
        permit(owner: string, spender: string, value: number | string, deadline: number | string, v: number | string, r: string | number[], s: string | number[]): CeloTxObject<void>;
        MINIMUM_LIQUIDITY(): CeloTxObject<string>;
        factory(): CeloTxObject<string>;
        token0(): CeloTxObject<string>;
        token1(): CeloTxObject<string>;
        getReserves(): CeloTxObject<{
            reserve0: string;
            reserve1: string;
            blockTimestampLast: string;
            0: string;
            1: string;
            2: string;
        }>;
        price0CumulativeLast(): CeloTxObject<string>;
        price1CumulativeLast(): CeloTxObject<string>;
        kLast(): CeloTxObject<string>;
        mint(to: string): CeloTxObject<string>;
        burn(to: string): CeloTxObject<{
            amount0: string;
            amount1: string;
            0: string;
            1: string;
        }>;
        swap(amount0Out: number | string, amount1Out: number | string, to: string, data: string | number[]): CeloTxObject<void>;
        skim(to: string): CeloTxObject<void>;
        sync(): CeloTxObject<void>;
        initialize(arg0: string, arg1: string): CeloTxObject<void>;
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
        Burn: ContractEvent<{
            sender: string;
            amount0: string;
            amount1: string;
            to: string;
            0: string;
            1: string;
            2: string;
            3: string;
        }>;
        Mint: ContractEvent<{
            sender: string;
            amount0: string;
            amount1: string;
            0: string;
            1: string;
            2: string;
        }>;
        Swap: ContractEvent<{
            sender: string;
            amount0In: string;
            amount1In: string;
            amount0Out: string;
            amount1Out: string;
            to: string;
            0: string;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
        }>;
        Sync: ContractEvent<{
            reserve0: string;
            reserve1: string;
            0: string;
            1: string;
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
export declare function newIUniswapV2Pair(web3: Web3, address: string): IUniswapV2Pair;
