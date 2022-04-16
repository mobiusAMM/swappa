"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryBalancer = void 0;
const async_1 = require("@celo/utils/lib/async");
const IBRegistry_1 = require("../../types/web3-v1-contracts/IBRegistry");
const bpool_1 = require("../pairs/bpool");
const registry_1 = require("../registry");
const utils_1 = require("../utils");
class RegistryBalancer extends registry_1.Registry {
    constructor(name, web3, registryAddr) {
        super(name);
        this.web3 = web3;
        this.findPairs = async (tokenWhitelist) => {
            const chainId = await this.web3.eth.getChainId();
            const pairsToFetch = [];
            for (let i = 0; i < tokenWhitelist.length - 1; i += 1) {
                for (let j = i + 1; j < tokenWhitelist.length; j += 1) {
                    pairsToFetch.push({ tokenA: tokenWhitelist[i], tokenB: tokenWhitelist[j] });
                }
            }
            const poolPairs = new Map();
            await (0, async_1.concurrentMap)(10, pairsToFetch, async (toFetch) => {
                const pools = await this.registry.methods.getBestPools(toFetch.tokenA, toFetch.tokenB).call();
                if (pools.length == 0) {
                    return null;
                }
                for (const poolAddr of pools) {
                    const pool = new bpool_1.PairBPool(chainId, this.web3, poolAddr, toFetch.tokenA, toFetch.tokenB);
                    // bpool can be used for each input & output combination
                    let key;
                    if (toFetch.tokenA.toLowerCase().localeCompare(toFetch.tokenB.toLowerCase()) > 0) {
                        key = `${poolAddr}-${toFetch.tokenA}:${toFetch.tokenB}`;
                    }
                    else {
                        key = `${poolAddr}-${toFetch.tokenB}:${toFetch.tokenA}`;
                    }
                    if (poolPairs.has(key)) {
                        // already has this pool and token combination
                        continue;
                    }
                    poolPairs.set(key, pool);
                }
            });
            return (0, utils_1.initPairsAndFilterByWhitelist)(Array.from(poolPairs.values()), tokenWhitelist);
        };
        this.registry = new web3.eth.Contract(IBRegistry_1.ABI, registryAddr);
    }
}
exports.RegistryBalancer = RegistryBalancer;
//# sourceMappingURL=balancer.js.map