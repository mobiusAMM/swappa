"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwappaRouterV1ABI = exports.swappaRouterV1Address = void 0;
__exportStar(require("./swappa-manager"), exports);
__exportStar(require("./pair"), exports);
__exportStar(require("./pairs"), exports);
__exportStar(require("./registry"), exports);
__exportStar(require("./router"), exports);
__exportStar(require("./registries/static"), exports);
__exportStar(require("./registries/aave"), exports);
__exportStar(require("./registries/mento"), exports);
__exportStar(require("./registries/uniswapv2"), exports);
__exportStar(require("./registry-cfg"), exports);
var mainnet_SwappaRouterV1_addr_json_1 = require("../tools/deployed/mainnet.SwappaRouterV1.addr.json");
Object.defineProperty(exports, "swappaRouterV1Address", { enumerable: true, get: function () { return mainnet_SwappaRouterV1_addr_json_1.address; } });
var SwappaRouterV1_1 = require("../types/web3-v1-contracts/SwappaRouterV1");
Object.defineProperty(exports, "SwappaRouterV1ABI", { enumerable: true, get: function () { return SwappaRouterV1_1.ABI; } });
//# sourceMappingURL=index.js.map