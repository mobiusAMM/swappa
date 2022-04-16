"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryStatic = void 0;
const registry_1 = require("../registry");
const utils_1 = require("../utils");
class RegistryStatic extends registry_1.Registry {
    constructor(name, pairsAll) {
        super(name);
        this.pairsAll = pairsAll;
        this.findPairs = async (tokenWhitelist) => {
            return (0, utils_1.initPairsAndFilterByWhitelist)(await this.pairsAll, tokenWhitelist);
        };
    }
}
exports.RegistryStatic = RegistryStatic;
//# sourceMappingURL=static.js.map