"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairAToken = exports.ReserveCELO = void 0;
const ILendingPool_1 = require("../../types/web3-v1-contracts/ILendingPool");
const ILendingPoolAddressesProvider_1 = require("../../types/web3-v1-contracts/ILendingPoolAddressesProvider");
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairAToken_addr_json_1 = require("../../tools/deployed/mainnet.PairAToken.addr.json");
exports.ReserveCELO = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
class PairAToken extends pair_1.Pair {
    constructor(chainId, kit, providerAddr, reserve) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairAToken_addr_json_1.address }));
        this.kit = kit;
        this.providerAddr = providerAddr;
        this.reserve = reserve;
        this.allowRepeats = true;
        this.provider = new kit.web3.eth.Contract(ILendingPoolAddressesProvider_1.ABI, providerAddr);
    }
    async _init() {
        const lendingPoolAddr = await this.provider.methods.getLendingPool().call();
        const lendingPool = new this.kit.web3.eth.Contract(ILendingPool_1.ABI, lendingPoolAddr);
        const data = await lendingPool.methods.getReserveData(this.reserve).call();
        const tokenA = data.aTokenAddress;
        const tokenB = this.reserve === exports.ReserveCELO ? (await this.kit.contracts.getGoldToken()).address : this.reserve;
        return {
            pairKey: null,
            tokenA, tokenB,
        };
    }
    async refresh() { }
    swapExtraData(inputToken) {
        const swapType = inputToken === this.tokenA ? "01" :
            this.reserve === exports.ReserveCELO ? "02" : "03";
        return `${this.providerAddr}${swapType}`;
    }
    outputAmount(inputToken, inputAmount) {
        if (inputToken !== this.tokenA && inputToken !== this.tokenB) {
            throw new Error(`unsupported input: ${inputToken}, pair: ${this.tokenA}/${this.tokenB}!`);
        }
        return inputAmount;
    }
    snapshot() {
        return {};
    }
    restore(snapshot) {
        // do nothing
    }
}
exports.PairAToken = PairAToken;
//# sourceMappingURL=atoken.js.map