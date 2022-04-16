"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapTX = exports.SwappaManager = void 0;
const connect_1 = require("@celo/connect");
const async_1 = require("@celo/utils/lib/async");
const SwappaRouterV1_1 = require("../types/web3-v1-contracts/SwappaRouterV1");
const router_1 = require("./router");
class SwappaManager {
    constructor(kit, routerAddr, registries) {
        this.kit = kit;
        this.routerAddr = routerAddr;
        this.registries = registries;
        this.pairs = [];
        this.pairsByToken = new Map();
        this.pairsByRegistry = new Map();
        this.reinitializePairs = async (tokenWhitelist) => {
            this.pairsByRegistry = new Map();
            const pairsAll = await (0, async_1.concurrentMap)(5, this.registries, (r) => r.findPairs(tokenWhitelist).then(pairs => {
                this.pairsByRegistry.set(r.getName(), pairs);
                return pairs;
            }));
            this.pairs = [];
            this.pairsByToken = new Map();
            pairsAll.forEach((pairs) => {
                pairs.forEach((p) => {
                    this.pairs.push(p);
                    for (const token of [p.tokenA, p.tokenB]) {
                        const x = this.pairsByToken.get(token);
                        if (x) {
                            x.push(p);
                        }
                        else {
                            this.pairsByToken.set(token, [p]);
                        }
                    }
                });
            });
            return this.pairs;
        };
        this.refreshPairs = async () => {
            await (0, async_1.concurrentMap)(10, this.pairs, (p) => p.refresh());
            return this.pairs;
        };
        this.findBestRoutesForFixedInputAmount = (inputToken, outputToken, inputAmount, opts) => {
            return (0, router_1.findBestRoutesForFixedInputAmount)(this.pairsByToken, inputToken, outputToken, inputAmount, opts);
        };
        this.swap = (route, inputAmount, minOutputAmount, to, opts) => {
            return (0, exports.swapTX)(this.kit, this.routerAddr, route, inputAmount, minOutputAmount, to, opts);
        };
    }
    getPairsByRegistry(registry) {
        return this.pairsByRegistry.get(registry) || [];
    }
}
exports.SwappaManager = SwappaManager;
const swapTX = (kit, routerAddr, route, inputAmount, minOutputAmount, to, opts) => {
    const router = new kit.web3.eth.Contract(SwappaRouterV1_1.ABI, routerAddr);
    const routeData = route.pairs.map((p, idx) => p.swapData(route.path[idx]));
    const deadlineMs = (opts === null || opts === void 0 ? void 0 : opts.deadlineMs) || (Date.now() / 1000 + 60);
    const swapF = (opts === null || opts === void 0 ? void 0 : opts.precheckOutputAmount) ? router.methods.swapExactInputForOutputWithPrecheck : router.methods.swapExactInputForOutput;
    const tx = (0, connect_1.toTransactionObject)(kit.connection, swapF(route.path, routeData.map((d) => d.addr), routeData.map((d) => d.extra), inputAmount.toFixed(0), minOutputAmount.toFixed(0), to, deadlineMs.toFixed(0)));
    return tx;
};
exports.swapTX = swapTX;
//# sourceMappingURL=swappa-manager.js.map