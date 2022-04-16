"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAddress = exports.initPairsAndFilterByWhitelist = void 0;
const async_1 = require("@celo/utils/lib/async");
const initPairsAndFilterByWhitelist = async (pairs, tokenWhitelist) => {
    await (0, async_1.concurrentMap)(10, pairs, (p) => p.init());
    return pairs.filter((p) => (tokenWhitelist.indexOf(p.tokenA) >= 0 &&
        tokenWhitelist.indexOf(p.tokenB) >= 0));
};
exports.initPairsAndFilterByWhitelist = initPairsAndFilterByWhitelist;
const selectAddress = (chainId, addresses) => {
    switch (chainId) {
        case 42220:
            if (!addresses.mainnet) {
                throw new Error(`no address provided for Mainnet (${chainId})!`);
            }
            return addresses.mainnet;
        case 62320:
            if (!addresses.baklava) {
                throw new Error(`no address provided for Baklava (${chainId})!`);
            }
            return addresses.baklava;
        case 44787:
            if (!addresses.alfajores) {
                throw new Error(`no address provided for Alfajores (${chainId})!`);
            }
            return addresses.alfajores;
        default:
            throw new Error(`unknown chainId: ${chainId}!`);
    }
};
exports.selectAddress = selectAddress;
//# sourceMappingURL=utils.js.map