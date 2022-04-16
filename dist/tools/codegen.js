"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typechain_target_web3_v1_celo_1 = __importDefault(require("@celo/typechain-target-web3-v1-celo"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ts_generator_1 = require("ts-generator");
const ROOT_DIR = path_1.default.normalize(path_1.default.join(__dirname, '../'));
async function generateContractTypes() {
    console.log('contractkit: Generating Types');
    const typesDir = path_1.default.join("types", "web3-v1-contracts");
    (0, child_process_1.execSync)(`rm -rf ${typesDir}`, { cwd: ROOT_DIR });
    const web3Generator = new typechain_target_web3_v1_celo_1.default({
        cwd: ROOT_DIR,
        rawConfig: {
            files: `${ROOT_DIR}/build/contracts/*.json`,
            outDir: typesDir,
        },
    });
    await (0, ts_generator_1.tsGenerator)({ cwd: ROOT_DIR, loggingLvl: 'info' }, web3Generator);
    // HAX: remove `receive` functions from ABI because web3 doesn't recognize them.
    const extraFlag = process.platform === "darwin" ? "''" : "";
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "SwappaRouterV1.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairUniswapV2.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairMento.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairAToken.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairStableSwap.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairSavingsCELO.ts")}`, { cwd: ROOT_DIR });
    (0, child_process_1.execSync)(`sed -e '/type\:\ \"receive\"/d' -i ${extraFlag} ${path_1.default.join(typesDir, "PairATokenV2.ts")}`, { cwd: ROOT_DIR });
}
generateContractTypes()
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=codegen.js.map