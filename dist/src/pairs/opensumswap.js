"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairOpenSumSwap = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const IOpenSumSwap_1 = require("../../types/web3-v1-contracts/IOpenSumSwap");
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairOpenSumSwap_addr_json_1 = require("../../tools/deployed/mainnet.PairOpenSumSwap.addr.json");
const ZERO = new bignumber_js_1.default(0);
class PairOpenSumSwap extends pair_1.Pair {
    constructor(chainId, web3, swapPoolAddr) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairOpenSumSwap_addr_json_1.address }));
        this.swapPoolAddr = swapPoolAddr;
        this.allowRepeats = false;
        this.paused = false;
        this.balances = [];
        this.swapPool = new web3.eth.Contract(IOpenSumSwap_1.ABI, swapPoolAddr);
    }
    async _init() {
        const [tokenA, tokenB,] = await Promise.all([
            this.swapPool.methods.getToken(0).call(),
            this.swapPool.methods.getToken(1).call(),
        ]);
        return {
            pairKey: this.swapPoolAddr,
            tokenA, tokenB,
        };
    }
    async refresh() {
        const [paused, balances] = await Promise.all([
            this.swapPool.methods.paused().call(),
            this.swapPool.methods.getBalances().call(),
        ]);
        if (balances.length !== 2) {
            throw new Error("pool must have only 2 tokens!");
        }
        this.paused = paused;
        this.balances = balances.map(b => new bignumber_js_1.default(b));
    }
    outputAmount(inputToken, inputAmount) {
        if (this.paused) {
            return ZERO;
        }
        if (inputToken === this.tokenA && inputAmount.gt(this.balances[1])) {
            // not enough for conversion
            return ZERO;
        }
        else if (inputToken === this.tokenB && inputAmount.gt(this.balances[0])) {
            // not enough for conversion
            return ZERO;
        }
        return inputAmount;
    }
    swapExtraData() {
        return this.swapPoolAddr;
    }
    snapshot() {
        return {
            paused: this.paused,
            balances: this.balances.map(b => b.toFixed())
        };
    }
    restore(snapshot) {
        this.paused = snapshot.paused;
        this.balances = snapshot.balances.map(b => new bignumber_js_1.default(b));
    }
}
exports.PairOpenSumSwap = PairOpenSumSwap;
//# sourceMappingURL=opensumswap.js.map