"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairATokenV2 = void 0;
const ILendingPoolV2_1 = require("../../types/web3-v1-contracts/ILendingPoolV2");
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairATokenV2_addr_json_1 = require("../../tools/deployed/mainnet.PairATokenV2.addr.json");
class PairATokenV2 extends pair_1.Pair {
    constructor(chainId, web3, poolAddr, reserve) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairATokenV2_addr_json_1.address }));
        this.web3 = web3;
        this.poolAddr = poolAddr;
        this.reserve = reserve;
        this.allowRepeats = true;
        this.pool = new this.web3.eth.Contract(ILendingPoolV2_1.ABI, this.poolAddr);
    }
    async _init() {
        const data = await this.pool.methods.getReserveData(this.reserve).call();
        const tokenA = data.aTokenAddress;
        const tokenB = this.reserve;
        return {
            pairKey: null,
            tokenA, tokenB,
        };
    }
    async refresh() { }
    swapExtraData(inputToken) {
        const swapType = inputToken === this.tokenA ? "01" : "02";
        return `${this.poolAddr}${swapType}`;
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
exports.PairATokenV2 = PairATokenV2;
//# sourceMappingURL=atoken-v2.js.map