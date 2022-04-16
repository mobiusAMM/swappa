"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairStableSwap = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ISwap_1 = require("../../types/web3-v1-contracts/ISwap");
const ERC20_1 = require("../../types/web3-v1-contracts/ERC20");
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairStableSwap_addr_json_1 = require("../../tools/deployed/mainnet.PairStableSwap.addr.json");
class PairStableSwap extends pair_1.Pair {
    constructor(chainId, web3, swapPoolAddr) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairStableSwap_addr_json_1.address }));
        this.web3 = web3;
        this.swapPoolAddr = swapPoolAddr;
        this.allowRepeats = false;
        this.paused = false;
        this.tokenPrecisionMultipliers = [];
        this.balancesWithAdjustedPrecision = [];
        this.swapFee = new bignumber_js_1.default(0);
        this.preciseA = new bignumber_js_1.default(0);
        this.getY = (x, xp, a) => {
            // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L531
            const d = this.getD(xp, a);
            const nTokens = xp.length;
            const nA = a.multipliedBy(nTokens);
            const s = x;
            const c = d
                .multipliedBy(d).div(x.multipliedBy(nTokens))
                .integerValue()
                .multipliedBy(d).multipliedBy(PairStableSwap.A_PRECISION).div(nA.multipliedBy(nTokens))
                .integerValue();
            const b = s.plus(d.multipliedBy(PairStableSwap.A_PRECISION).div(nA)).integerValue();
            let yPrev;
            let y = d;
            for (let i = 0; i < 256; i++) {
                yPrev = y;
                y = y.multipliedBy(y).plus(c).div(y.multipliedBy(2).plus(b).minus(d))
                    .integerValue();
                if (y.minus(yPrev).abs().lte(1)) {
                    return y;
                }
            }
            throw new Error("SwapPool approximation did not converge!");
        };
        this.swapPool = new web3.eth.Contract(ISwap_1.ABI, swapPoolAddr);
    }
    async _init() {
        const [tokenA, tokenB,] = await Promise.all([
            this.swapPool.methods.getToken(0).call(),
            this.swapPool.methods.getToken(1).call(),
        ]);
        const erc20A = new this.web3.eth.Contract(ERC20_1.ABI, tokenA);
        const erc20B = new this.web3.eth.Contract(ERC20_1.ABI, tokenB);
        const [decimalsA, decimalsB,] = await Promise.all([
            erc20A.methods.decimals().call(),
            erc20B.methods.decimals().call(),
        ]);
        this.tokenPrecisionMultipliers = [
            new bignumber_js_1.default(10).pow(PairStableSwap.POOL_PRECISION_DECIMALS - Number.parseInt(decimalsA)),
            new bignumber_js_1.default(10).pow(PairStableSwap.POOL_PRECISION_DECIMALS - Number.parseInt(decimalsB)),
        ];
        return {
            pairKey: this.swapPoolAddr,
            tokenA, tokenB,
        };
    }
    async refresh() {
        const [paused, balances, swapFee, preciseA,] = await Promise.all([
            this.swapPool.methods.paused().call(),
            this.swapPool.methods.getBalances().call(),
            this.swapPool.methods.getSwapFee().call(),
            this.swapPool.methods.getAPrecise().call(),
        ]);
        if (balances.length !== 2) {
            throw new Error("pool must have only 2 tokens!");
        }
        this.paused = paused;
        this.balancesWithAdjustedPrecision = balances.map((b, idx) => this.tokenPrecisionMultipliers[idx].multipliedBy(b));
        this.swapFee = new bignumber_js_1.default(swapFee).div(new bignumber_js_1.default(10).pow(10));
        this.preciseA = new bignumber_js_1.default(preciseA);
    }
    outputAmount(inputToken, inputAmount) {
        if (this.paused) {
            return new bignumber_js_1.default(0);
        }
        // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L617
        const [tokenIndexFrom, tokenIndexTo] = inputToken === this.tokenA ? [0, 1] : [1, 0];
        const x = inputAmount
            .multipliedBy(this.tokenPrecisionMultipliers[tokenIndexFrom])
            .plus(this.balancesWithAdjustedPrecision[tokenIndexFrom]);
        const y = this.getY(x, this.balancesWithAdjustedPrecision, this.preciseA);
        const outputAmountWithFee = this.balancesWithAdjustedPrecision[tokenIndexTo].minus(y).minus(1);
        const fee = outputAmountWithFee.multipliedBy(this.swapFee);
        const outputAmount = outputAmountWithFee.minus(fee).div(this.tokenPrecisionMultipliers[tokenIndexTo]).integerValue();
        return outputAmount;
    }
    getD(xp, a) {
        // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L393
        const s = bignumber_js_1.default.sum(...xp);
        if (s.eq(0)) {
            return s;
        }
        let prevD;
        let d = s;
        const nTokens = xp.length;
        const nA = a.multipliedBy(nTokens);
        for (let i = 0; i < 256; i++) {
            let dP = d;
            xp.forEach((x) => {
                dP = dP.multipliedBy(d).div(x.multipliedBy(nTokens)).integerValue();
            });
            prevD = d;
            d = nA.multipliedBy(s).div(PairStableSwap.A_PRECISION).plus(dP.multipliedBy(nTokens)).multipliedBy(d).div(nA.minus(PairStableSwap.A_PRECISION).multipliedBy(d).div(PairStableSwap.A_PRECISION).plus(new bignumber_js_1.default(nTokens).plus(1).multipliedBy(dP))).integerValue();
            if (d.minus(prevD).abs().lte(1)) {
                return d;
            }
        }
        throw new Error("SwapPool D does not converge!");
    }
    swapExtraData() {
        return this.swapPoolAddr;
    }
    snapshot() {
        return {
            paused: this.paused,
            tokenPrecisionMultipliers: this.tokenPrecisionMultipliers.map(n => n.toFixed()),
            balancesWithAdjustedPrecision: this.balancesWithAdjustedPrecision.map(n => n.toFixed()),
            swapFee: this.swapFee.toFixed(),
            preciseA: this.preciseA.toFixed()
        };
    }
    restore(snapshot) {
        this.paused = snapshot.paused;
        this.tokenPrecisionMultipliers = snapshot.tokenPrecisionMultipliers.map(r => new bignumber_js_1.default(r));
        this.balancesWithAdjustedPrecision = snapshot.balancesWithAdjustedPrecision.map(r => new bignumber_js_1.default(r));
        this.swapFee = new bignumber_js_1.default(snapshot.swapFee);
        this.preciseA = new bignumber_js_1.default(snapshot.preciseA);
    }
}
exports.PairStableSwap = PairStableSwap;
PairStableSwap.POOL_PRECISION_DECIMALS = 18;
PairStableSwap.A_PRECISION = 100;
//# sourceMappingURL=stableswap.js.map