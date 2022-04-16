"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairUniswapV2 = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const IUniswapV2Pair_1 = require("../../types/web3-v1-contracts/IUniswapV2Pair");
const pair_1 = require("../pair");
const mainnet_PairUniswapV2_addr_json_1 = require("../../tools/deployed/mainnet.PairUniswapV2.addr.json");
const utils_1 = require("../utils");
class PairUniswapV2 extends pair_1.PairXYeqK {
    constructor(chainId, web3, pairAddr, fixedFee = new bignumber_js_1.default(0.997)) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairUniswapV2_addr_json_1.address }));
        this.web3 = web3;
        this.pairAddr = pairAddr;
        this.fixedFee = fixedFee;
        this.allowRepeats = false;
        this.pair = new this.web3.eth.Contract(IUniswapV2Pair_1.ABI, pairAddr);
        const feeKInv = new bignumber_js_1.default(1000).minus(this.fixedFee.multipliedBy(1000));
        if (!feeKInv.isInteger() || !feeKInv.gt(0) || !feeKInv.lt(100)) {
            throw new Error(`Invalid fixedFee: ${this.fixedFee}!`);
        }
        this.feeKData = feeKInv.toString(16).padStart(2, "0");
    }
    async _init() {
        const [tokenA, tokenB] = await Promise.all([
            this.pair.methods.token0().call(),
            this.pair.methods.token1().call(),
        ]);
        return {
            pairKey: this.pairAddr,
            tokenA, tokenB,
        };
    }
    async refresh() {
        if (!this.pair) {
            throw new Error(`not initialized!`);
        }
        const reserves = await this.pair.methods.getReserves().call();
        this.refreshBuckets(this.fixedFee, new bignumber_js_1.default(reserves[0]), new bignumber_js_1.default(reserves[1]));
    }
    swapExtraData() {
        return `${this.pair.options.address}${this.feeKData}`;
    }
}
exports.PairUniswapV2 = PairUniswapV2;
//# sourceMappingURL=uniswapv2.js.map