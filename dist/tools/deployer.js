#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const contractkit_1 = require("@celo/contractkit");
const SwappaRouterV1_json_1 = __importDefault(require("../build/contracts/SwappaRouterV1.json"));
const PairUniswapV2_json_1 = __importDefault(require("../build/contracts/PairUniswapV2.json"));
const PairMento_json_1 = __importDefault(require("../build/contracts/PairMento.json"));
const PairAToken_json_1 = __importDefault(require("../build/contracts/PairAToken.json"));
const PairStableSwap_json_1 = __importDefault(require("../build/contracts/PairStableSwap.json"));
const PairSavingsCELO_json_1 = __importDefault(require("../build/contracts/PairSavingsCELO.json"));
const PairATokenV2_json_1 = __importDefault(require("../build/contracts/PairATokenV2.json"));
const PairBPool_json_1 = __importDefault(require("../build/contracts/PairBPool.json"));
const PairOpenSumSwap_json_1 = __importDefault(require("../build/contracts/PairOpenSumSwap.json"));
const PairSymmetricSwap_json_1 = __importDefault(require("../build/contracts/PairSymmetricSwap.json"));
process.on('unhandledRejection', (reason, _promise) => {
    // @ts-ignore
    console.error('Unhandled Rejection at:', reason.stack || reason);
    process.exit(0);
});
commander_1.program
    .option("-n --network <name>", "Network to deploy to. Options: ganache, alfajores, baklava, mainnet", "ganache")
    .option("--from <address>", "Deployer address")
    .parse();
const networks = {
    // "ganache": "http://127.0.0.1:7545",
    // "alfajores": "https://alfajores-forno.celo-testnet.org",
    "baklava": "http://127.0.0.1:8546",
    "mainnet": "http://127.0.0.1:8545",
};
// Relative path to the deploy folder changes depending on if it is run directly or using ts-node.
const contractsPath = path_1.default.join(__dirname, "deployed");
function contractAddress(network, contractName) {
    const fpath = path_1.default.join(contractsPath, `${network}.${contractName}.addr.json`);
    if (!fs_1.default.existsSync(fpath)) {
        return null;
    }
    const data = JSON.parse(fs_1.default.readFileSync(fpath).toString());
    return data.address;
}
function storeContractAddress(network, contractName, contractAddress) {
    fs_1.default.writeFileSync(path_1.default.join(contractsPath, `${network}.${contractName}.addr.json`), JSON.stringify({ address: contractAddress }));
}
async function readAddressOrDeployContract(kit, network, contractName, contractData) {
    let address = contractAddress(network, contractName);
    if (!address) {
        console.info("DEPLOYING:", contractName, "...");
        const receipt = await (await kit
            .sendTransaction({ data: contractData }))
            .waitReceipt();
        address = receipt.contractAddress;
        if (!address) {
            throw new Error("Contract address not found?");
        }
        storeContractAddress(network, contractName, address);
    }
    console.info("DEPLOYED:", contractName, "ADDRESS:", address);
    return address;
}
async function main() {
    const opts = commander_1.program.opts();
    const networkURL = networks[opts.network];
    if (!networkURL) {
        throw new Error(`Unsupported network: ${opts.network}`);
    }
    const kit = (0, contractkit_1.newKit)(networkURL);
    kit.defaultAccount = opts.from;
    await readAddressOrDeployContract(kit, opts.network, "SwappaRouterV1", SwappaRouterV1_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairUniswapV2", PairUniswapV2_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairMento", PairMento_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairAToken", PairAToken_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairStableSwap", PairStableSwap_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairSavingsCELO", PairSavingsCELO_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairATokenV2", PairATokenV2_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairBPool", PairBPool_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairOpenSumSwap", PairOpenSumSwap_json_1.default.bytecode);
    await readAddressOrDeployContract(kit, opts.network, "PairSymmetricSwap", PairSymmetricSwap_json_1.default.bytecode);
}
main();
//# sourceMappingURL=deployer.js.map