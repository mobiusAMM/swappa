"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairBPool = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const IBPool_1 = require("../../types/web3-v1-contracts/IBPool");
const pair_1 = require("../pair");
const mainnet_PairBPool_addr_json_1 = require("../../tools/deployed/mainnet.PairBPool.addr.json");
const utils_1 = require("../utils");
const ZERO = new bignumber_js_1.default(0);
const ONE = new bignumber_js_1.default(1);
const BONE = new bignumber_js_1.default(10 ** 18);
class PairBPool extends pair_1.Pair {
    constructor(chainId, web3, poolAddr, tokenA, tokenB) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairBPool_addr_json_1.address }));
        this.poolAddr = poolAddr;
        this.tokenA = tokenA;
        this.tokenB = tokenB;
        this.allowRepeats = false;
        this.swapFee = ZERO;
        this.weightA = ZERO;
        this.weightB = ZERO;
        this.balanceA = ZERO;
        this.balanceB = ZERO;
        this.bPool = new web3.eth.Contract(IBPool_1.ABI, poolAddr);
    }
    async _init() {
        const [swapFee, weightA, weightB] = await Promise.all([
            this.bPool.methods.getSwapFee().call(),
            this.bPool.methods.getDenormalizedWeight(this.tokenA).call(),
            this.bPool.methods.getDenormalizedWeight(this.tokenB).call(),
        ]);
        this.swapFee = new bignumber_js_1.default(swapFee).div(BONE);
        this.weightA = new bignumber_js_1.default(weightA);
        this.weightB = new bignumber_js_1.default(weightB);
        return {
            pairKey: this.poolAddr,
            tokenA: this.tokenA,
            tokenB: this.tokenB,
        };
    }
    async refresh() {
        const [balanceA, balanceB] = await Promise.all([
            this.bPool.methods.getBalance(this.tokenA).call(),
            this.bPool.methods.getBalance(this.tokenB).call()
        ]);
        this.balanceA = new bignumber_js_1.default(balanceA);
        this.balanceB = new bignumber_js_1.default(balanceB);
    }
    outputAmount(inputToken, inputAmount) {
        if (this.balanceA.lt(1) || this.balanceB.lt(1)) {
            return ZERO;
        }
        let tokenBalanceIn, tokenBalanceOut, tokenWeightIn, tokenWeightOut;
        if (inputToken === this.tokenA) {
            [tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut] = [
                this.balanceA, this.weightA,
                this.balanceB, this.weightB
            ];
        }
        else {
            [tokenBalanceIn, tokenWeightIn, tokenBalanceOut, tokenWeightOut] = [
                this.balanceB, this.weightB,
                this.balanceA, this.weightA
            ];
        }
        const weightRatio = new bignumber_js_1.default(tokenWeightIn).div(tokenWeightOut);
        const adjustedIn = inputAmount.multipliedBy(ONE.minus(this.swapFee));
        const y = tokenBalanceIn.div(tokenBalanceIn.plus(adjustedIn));
        // BigNumber.js does not support fractional exponentiation
        const multiplier = ONE.minus(Math.pow(y.toNumber(), weightRatio.toNumber()));
        return tokenBalanceOut.multipliedBy(multiplier).integerValue(bignumber_js_1.default.ROUND_DOWN);
    }
    swapExtraData() {
        return this.poolAddr;
    }
    snapshot() {
        return {
            balanceA: this.balanceA.toFixed(),
            balanceB: this.balanceB.toFixed()
        };
    }
    restore(snapshot) {
        this.balanceA = new bignumber_js_1.default(snapshot.balanceA);
        this.balanceB = new bignumber_js_1.default(snapshot.balanceB);
    }
}
exports.PairBPool = PairBPool;
//# sourceMappingURL=bpool.js.map