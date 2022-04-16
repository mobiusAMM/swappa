"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairSavingsCELO = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const pair_1 = require("../pair");
const utils_1 = require("../utils");
const mainnet_PairSavingsCELO_addr_json_1 = require("../../tools/deployed/mainnet.PairSavingsCELO.addr.json");
const savingscelo_1 = require("@terminal-fi/savingscelo");
class PairSavingsCELO extends pair_1.Pair {
    constructor(chainId, kit, savingsCELOAddr) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairSavingsCELO_addr_json_1.address }));
        this.kit = kit;
        this.allowRepeats = true;
        this.savingsKit = new savingscelo_1.SavingsKit(kit, savingsCELOAddr);
    }
    async _init() {
        const celo = await this.kit.contracts.getGoldToken();
        const tokenA = celo.address;
        const tokenB = this.savingsKit.contractAddress;
        return {
            pairKey: null,
            tokenA, tokenB,
        };
    }
    async refresh() {
        this.totalSupplies = await this.savingsKit.totalSupplies();
    }
    swapExtraData(inputToken) {
        return this.savingsKit.contractAddress;
    }
    outputAmount(inputToken, inputAmount) {
        if (inputToken === this.tokenA) {
            return (0, savingscelo_1.celoToSavings)(inputAmount, this.totalSupplies.celoTotal, this.totalSupplies.savingsTotal);
        }
        else if (inputToken === this.tokenB) {
            return new bignumber_js_1.default(0);
        }
        else {
            throw new Error(`unsupported input: ${inputToken}, pair: ${this.tokenA}/${this.tokenB}!`);
        }
    }
    snapshot() {
        var _a, _b;
        return {
            celoTotal: ((_a = this.totalSupplies) === null || _a === void 0 ? void 0 : _a.celoTotal.toFixed()) || '',
            savingsTotal: ((_b = this.totalSupplies) === null || _b === void 0 ? void 0 : _b.savingsTotal.toFixed()) || ''
        };
    }
    restore(snapshot) {
        this.totalSupplies = {
            celoTotal: new bignumber_js_1.default(snapshot.celoTotal),
            savingsTotal: new bignumber_js_1.default(snapshot.savingsTotal)
        };
    }
}
exports.PairSavingsCELO = PairSavingsCELO;
//# sourceMappingURL=savingscelo.js.map