"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryUniswapV2 = void 0;
const async_1 = require("@celo/utils/lib/async");
const IUniswapV2Factory_1 = require("../../types/web3-v1-contracts/IUniswapV2Factory");
const uniswapv2_1 = require("../pairs/uniswapv2");
const registry_1 = require("../registry");
const utils_1 = require("../utils");
class RegistryUniswapV2 extends registry_1.Registry {
    constructor(name, web3, factoryAddr, opts) {
        super(name);
        this.web3 = web3;
        this.opts = opts;
        this.findPairs = async (tokenWhitelist) => {
            var _a;
            const chainId = await this.web3.eth.getChainId();
            let pairsFetched;
            if (!((_a = this.opts) === null || _a === void 0 ? void 0 : _a.fetchUsingAllPairs)) {
                const pairsToFetch = [];
                for (let i = 0; i < tokenWhitelist.length - 1; i += 1) {
                    for (let j = i + 1; j < tokenWhitelist.length; j += 1) {
                        pairsToFetch.push({ tokenA: tokenWhitelist[i], tokenB: tokenWhitelist[j] });
                    }
                }
                pairsFetched = await (0, async_1.concurrentMap)(10, pairsToFetch, async (toFetch) => {
                    var _a;
                    const pairAddr = await this.factory.methods.getPair(toFetch.tokenA, toFetch.tokenB).call();
                    if (pairAddr === "0x0000000000000000000000000000000000000000") {
                        return null;
                    }
                    return new uniswapv2_1.PairUniswapV2(chainId, this.web3, pairAddr, (_a = this.opts) === null || _a === void 0 ? void 0 : _a.fixedFee);
                });
            }
            else {
                const nPairs = Number.parseInt(await this.factory.methods.allPairsLength().call());
                pairsFetched = await (0, async_1.concurrentMap)(10, [...Array(nPairs).keys()], async (idx) => {
                    var _a;
                    const pairAddr = await this.factory.methods.allPairs(idx).call();
                    return new uniswapv2_1.PairUniswapV2(chainId, this.web3, pairAddr, (_a = this.opts) === null || _a === void 0 ? void 0 : _a.fixedFee);
                });
            }
            const pairs = pairsFetched.filter((p) => p !== null);
            return (0, utils_1.initPairsAndFilterByWhitelist)(pairs, tokenWhitelist);
        };
        this.factory = new web3.eth.Contract(IUniswapV2Factory_1.ABI, factoryAddr);
    }
}
exports.RegistryUniswapV2 = RegistryUniswapV2;
//# sourceMappingURL=uniswapv2.js.map