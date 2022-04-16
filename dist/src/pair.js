"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairXYeqK = exports.Pair = exports.Snapshot = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
class Snapshot {
}
exports.Snapshot = Snapshot;
class Pair {
    constructor(swappaPairAddress) {
        // pairKey is used to identify conflicting pairs. In a single route, every non-null pairKey must
        // be unique. On the otherhand, Pair-s with null pairKey can be used unlimited amount of times in
        // a single route.
        this.pairKey = null;
        this.tokenA = "";
        this.tokenB = "";
        this.swappaPairAddress = "";
        this.swappaPairAddress = swappaPairAddress;
    }
    async init() {
        const r = await this._init();
        this.pairKey = r.pairKey;
        this.tokenA = r.tokenA;
        this.tokenB = r.tokenB;
        return this.refresh();
    }
    swapData(inputToken) {
        return {
            addr: this.swappaPairAddress,
            extra: this.swapExtraData(inputToken),
        };
    }
}
exports.Pair = Pair;
class PairXYeqK extends Pair {
    constructor() {
        super(...arguments);
        this.fee = new bignumber_js_1.default(0);
        this.bucketA = new bignumber_js_1.default(0);
        this.bucketB = new bignumber_js_1.default(0);
    }
    refreshBuckets(fee, bucketA, bucketB) {
        this.fee = fee;
        this.bucketA = bucketA;
        this.bucketB = bucketB;
    }
    outputAmount(inputToken, inputAmount) {
        const buckets = inputToken === this.tokenA ? [this.bucketA, this.bucketB] :
            inputToken === this.tokenB ? [this.bucketB, this.bucketA] : null;
        if (buckets === null) {
            throw new Error(`unsupported input: ${inputToken}, pair: ${this.tokenA}/${this.tokenB}!`);
        }
        if (this.bucketA.lt(1) || this.bucketB.lt(1)) {
            return new bignumber_js_1.default(0);
        }
        const amountWithFee = inputAmount.multipliedBy(this.fee);
        const outputAmount = buckets[1].multipliedBy(amountWithFee).dividedToIntegerBy(buckets[0].plus(amountWithFee));
        return !outputAmount.isNaN() ? outputAmount : new bignumber_js_1.default(0);
    }
    inputAmount(outputToken, outputAmount) {
        const buckets = outputToken === this.tokenB ? [this.bucketA, this.bucketB] :
            outputToken === this.tokenA ? [this.bucketB, this.bucketA] : null;
        if (buckets === null) {
            throw new Error(`unsupported output: ${outputToken}, pair: ${this.tokenA}/${this.tokenB}!`);
        }
        return buckets[0].multipliedBy(outputAmount).div(buckets[1].minus(outputAmount).multipliedBy(this.fee));
    }
    snapshot() {
        return {
            fee: this.fee.toFixed(),
            bucketA: this.bucketA.toFixed(),
            bucketB: this.bucketB.toFixed(),
        };
    }
    restore(snapshot) {
        this.fee = new bignumber_js_1.default(snapshot.fee);
        this.bucketA = new bignumber_js_1.default(snapshot.bucketA);
        this.bucketB = new bignumber_js_1.default(snapshot.bucketB);
    }
}
exports.PairXYeqK = PairXYeqK;
//# sourceMappingURL=pair.js.map