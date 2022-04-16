"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBestRoutesForFixedInputAmount = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const findBestRoutesForFixedInputAmount = (pairsByToken, inputToken, outputToken, inputAmount, opts) => {
    const maxSwaps = (opts === null || opts === void 0 ? void 0 : opts.maxSwaps) || 10;
    const completedRoutes = [];
    let currentRoutes = new Map([
        [
            inputToken, {
                pairs: [],
                path: [inputToken],
                pathAmounts: [inputAmount],
                outputToken: inputToken,
                outputAmount: inputAmount,
            }
        ]
    ]);
    const maxOutputAmounts = new Map([
        [inputToken, inputAmount],
    ]);
    for (let d = 0; d < maxSwaps; d += 1) {
        const nextRoutes = new Map();
        for (const route of currentRoutes.values()) {
            const matchingPairs = pairsByToken.get(route.outputToken) || [];
            for (const pair of matchingPairs) {
                const outputT = pair.tokenA === route.outputToken ? pair.tokenB :
                    pair.tokenB === route.outputToken ? pair.tokenA : null;
                if (!outputT) {
                    throw new Error(`pairsByToken is invalid? ${pair.tokenA}/${pair.tokenB} !== ${route.outputToken}`);
                }
                if (pair.pairKey !== null && route.pairs.find((p) => p.pairKey === pair.pairKey)) {
                    continue; // skip already used or conflicting pairs.
                }
                const outputTAmount = pair.outputAmount(route.outputToken, route.outputAmount);
                const maxOutputAmount = maxOutputAmounts.get(outputT) || new bignumber_js_1.default(0);
                if (maxOutputAmount.gte(outputTAmount)) {
                    continue; // we have already explored better routes before.
                }
                maxOutputAmounts.set(outputT, outputTAmount);
                const routeT = {
                    pairs: [...route.pairs, pair],
                    path: [...route.path, outputT],
                    pathAmounts: [...route.pathAmounts, outputTAmount],
                    outputToken: outputT,
                    outputAmount: outputTAmount,
                };
                nextRoutes.set(outputT, routeT);
                if (outputT === outputToken) {
                    completedRoutes.push(routeT);
                }
            }
        }
        currentRoutes = nextRoutes;
        // console.debug(`UBE ROUTER: Depth: ${d+1}, routes: ${currentRoutes.size}, completed: ${completedRoutes.length}`)
        if (currentRoutes.size === 0) {
            break;
        }
    }
    completedRoutes.sort((a, b) => a.outputAmount.gt(b.outputAmount) ? -1 : 1);
    return completedRoutes;
};
exports.findBestRoutesForFixedInputAmount = findBestRoutesForFixedInputAmount;
//# sourceMappingURL=router.js.map