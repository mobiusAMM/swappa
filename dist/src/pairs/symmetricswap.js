"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairSymmetricSwap = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const ISymmetricSwap_1 = require("../../types/web3-v1-contracts/ISymmetricSwap");
const IERC20_1 = require("../../types/web3-v1-contracts/IERC20");
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairSymmetricSwap_addr_json_1 = require("../../tools/deployed/mainnet.PairSymmetricSwap.addr.json");
const ZERO = new bignumber_js_1.default(0);
class PairSymmetricSwap extends pair_1.Pair {
    constructor(chainId, web3, swapPoolAddr, tokenA, tokenB) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairSymmetricSwap_addr_json_1.address }));
        this.swapPoolAddr = swapPoolAddr;
        this.tokenA = tokenA;
        this.tokenB = tokenB;
        this.allowRepeats = false;
        this.paused = false;
        this.balanceA = ZERO;
        this.balanceB = ZERO;
        // Unfortunately SymmetricSwap contract doesn't expose token addresses that it stores,
        // thus they have to be hardcoded in the constructor and can't be fetched from swapPool
        // directly.
        this.swapPool = new web3.eth.Contract(ISymmetricSwap_1.ABI, swapPoolAddr);
        this.ercA = new web3.eth.Contract(IERC20_1.ABI, tokenA);
        this.ercB = new web3.eth.Contract(IERC20_1.ABI, tokenB);
    }
    async _init() {
        return {
            pairKey: this.swapPoolAddr,
            tokenA: this.tokenA,
            tokenB: this.tokenB,
        };
    }
    async refresh() {
        let balanceA, balanceB;
        [
            this.paused,
            balanceA,
            balanceB
        ] = await Promise.all([
            this.swapPool.methods.paused().call(),
            this.ercA.methods.balanceOf(this.swapPoolAddr).call(),
            this.ercB.methods.balanceOf(this.swapPoolAddr).call(),
        ]);
        this.balanceA = new bignumber_js_1.default(balanceA);
        this.balanceB = new bignumber_js_1.default(balanceB);
    }
    outputAmount(inputToken, inputAmount) {
        if (this.paused) {
            return ZERO;
        }
        let outputBalance;
        if (inputToken === this.tokenA) {
            outputBalance = this.balanceB;
        }
        else if (inputToken === this.tokenB) {
            outputBalance = this.balanceA;
        }
        else {
            // invalid input token
            return ZERO;
        }
        if (outputBalance.lt(inputAmount)) {
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
            balanceA: this.balanceA.toFixed(),
            balanceB: this.balanceB.toFixed()
        };
    }
    restore(snapshot) {
        this.paused = snapshot.paused;
        this.balanceA = new bignumber_js_1.default(snapshot.balanceA);
        this.balanceB = new bignumber_js_1.default(snapshot.balanceB);
    }
}
exports.PairSymmetricSwap = PairSymmetricSwap;
//# sourceMappingURL=symmetricswap.js.map