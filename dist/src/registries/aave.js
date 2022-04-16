"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryAave = void 0;
const ILendingPool_1 = require("../../types/web3-v1-contracts/ILendingPool");
const ILendingPoolAddressesProvider_1 = require("../../types/web3-v1-contracts/ILendingPoolAddressesProvider");
const atoken_1 = require("../pairs/atoken");
const registry_1 = require("../registry");
const utils_1 = require("../utils");
class RegistryAave extends registry_1.Registry {
    constructor(name, kit, lendingPoolAddrProviderAddr) {
        super(name);
        this.kit = kit;
        this.findPairs = async (tokenWhitelist) => {
            const chainId = await this.kit.web3.eth.getChainId();
            const lendingPoolAddr = await this.lendingPoolAddrProvider.methods.getLendingPool().call();
            const lendingPool = new this.kit.web3.eth.Contract(ILendingPool_1.ABI, lendingPoolAddr);
            const reserves = await lendingPool.methods.getReserves().call();
            const reservesMatched = [
                atoken_1.ReserveCELO,
                ...reserves.filter((r) => tokenWhitelist.indexOf(r) >= 0),
            ];
            const pairs = reservesMatched.map((r) => (new atoken_1.PairAToken(chainId, this.kit, this.lendingPoolAddrProvider.options.address, r)));
            return (0, utils_1.initPairsAndFilterByWhitelist)(pairs, tokenWhitelist);
        };
        this.lendingPoolAddrProvider = new kit.web3.eth.Contract(ILendingPoolAddressesProvider_1.ABI, lendingPoolAddrProviderAddr);
    }
}
exports.RegistryAave = RegistryAave;
//# sourceMappingURL=aave.js.map