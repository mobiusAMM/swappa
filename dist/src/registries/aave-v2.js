"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryAaveV2 = void 0;
const ILendingPoolV2_1 = require("../../types/web3-v1-contracts/ILendingPoolV2");
const ILendingPoolAddressesProviderV2_1 = require("../../types/web3-v1-contracts/ILendingPoolAddressesProviderV2");
const utils_1 = require("../utils");
const atoken_v2_1 = require("../pairs/atoken-v2");
const registry_1 = require("../registry");
class RegistryAaveV2 extends registry_1.Registry {
    constructor(name, web3, lendingPoolAddrProviderAddr) {
        super(name);
        this.web3 = web3;
        this.findPairs = async (tokenWhitelist) => {
            const chainId = await this.web3.eth.getChainId();
            const poolAddr = await this.provider.methods.getLendingPool().call();
            const lendingPool = new this.web3.eth.Contract(ILendingPoolV2_1.ABI, poolAddr);
            const reserves = await lendingPool.methods.getReservesList().call();
            const reservesMatched = reserves.filter((r) => tokenWhitelist.indexOf(r) >= 0);
            const pairs = reservesMatched.map((r) => (new atoken_v2_1.PairATokenV2(chainId, this.web3, poolAddr, r)));
            return (0, utils_1.initPairsAndFilterByWhitelist)(pairs, tokenWhitelist);
        };
        this.provider = new web3.eth.Contract(ILendingPoolAddressesProviderV2_1.ABI, lendingPoolAddrProviderAddr);
    }
}
exports.RegistryAaveV2 = RegistryAaveV2;
//# sourceMappingURL=aave-v2.js.map