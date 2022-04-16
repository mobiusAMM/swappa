"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryMento = void 0;
const contractkit_1 = require("@celo/contractkit");
const async_1 = require("@celo/utils/lib/async");
const mento_1 = require("../pairs/mento");
const registry_1 = require("../registry");
const utils_1 = require("../utils");
class RegistryMento extends registry_1.Registry {
    constructor(kit) {
        super("mento");
        this.kit = kit;
        this.findPairs = async (tokenWhitelist) => {
            const cSTBs = await (0, async_1.concurrentMap)(5, Object.values(contractkit_1.StableToken), (stableToken) => {
                return this.kit.contracts.getStableToken(stableToken).then((wrapper) => ({
                    name: stableToken,
                    wrapper: wrapper,
                }));
            });
            const chainId = await this.kit.web3.eth.getChainId();
            const pairs = cSTBs.map((cSTB) => (new mento_1.PairMento(chainId, this.kit, cSTB.name)));
            return (0, utils_1.initPairsAndFilterByWhitelist)(pairs, tokenWhitelist);
        };
    }
}
exports.RegistryMento = RegistryMento;
//# sourceMappingURL=mento.js.map