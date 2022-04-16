#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const contractkit_1 = require("@celo/contractkit");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const connect_1 = require("@celo/connect");
const ubeswapTokens = __importStar(require("@ubeswap/default-token-list/ubeswap-experimental.token-list.json"));
const IERC20_1 = require("../../types/web3-v1-contracts/IERC20");
const mainnet_SwappaRouterV1_addr_json_1 = require("../../tools/deployed/mainnet.SwappaRouterV1.addr.json");
const swappa_manager_1 = require("../swappa-manager");
const registry_cfg_1 = require("../registry-cfg");
const mento_1 = require("../registries/mento");
const program = commander_1.default.program
    .option("--network <network>", "Celo client URL to connect to.", "http://localhost:8545")
    .option("--registries <registries>", "Registries to use for routing.", "all")
    .option("--input <input>", "Input token address or symbol.", "CELO")
    .option("--output <output>", "Output token address or symbol.", "cUSD")
    .option("--amount <amount>", "Input amount.", "0.001")
    .option("--max-swaps <max-swaps>", "Maximum number of swaps in a route.")
    .option("--from <from>", "If provided, will actally execute trade from given account.")
    .option("--max-slippage <max-slippage>", "Maximum allowed slippage.", "0.9999")
    .option("--no-precheck", "If provided, will skip expected output precheck.")
    .option("--benchmark <iterations>", "If non-zero, benchmark the route finding for N iterations.", "0")
    .parse(process.argv);
process.on('unhandledRejection', (reason, _promise) => {
    // @ts-ignore
    console.error('Unhandled Rejection for promise:', _promise, 'at:', reason.stack || reason);
    process.exit(1);
});
const registriesByName = {
    "mento": (kit) => new mento_1.RegistryMento(kit),
    "ubeswap": registry_cfg_1.mainnetRegistryUbeswap,
    "sushiswap": registry_cfg_1.mainnetRegistrySushiswap,
    "mobius": registry_cfg_1.mainnetRegistryMobius,
    "moola": registry_cfg_1.mainnetRegistryMoola,
    "moola-v2": registry_cfg_1.mainnetRegistryMoolaV2,
    "savingscelo": registry_cfg_1.mainnetRegistrySavingsCELO,
    "celodex": registry_cfg_1.mainnetRegistryCeloDex,
    "symmetric": registry_cfg_1.mainnetRegistrySymmetric,
    "misc": registry_cfg_1.mainnetRegistryMisc,
};
let chainId;
function tokenByAddrOrSymbol(addressOrSymbol) {
    const t = ubeswapTokens.tokens.find((t) => t.chainId === chainId && (t.address === addressOrSymbol || t.symbol === addressOrSymbol));
    if (!t) {
        throw new Error(`Unrecognized token: ${addressOrSymbol}!`);
    }
    return t;
}
async function main() {
    var _a;
    const opts = program.opts();
    const kit = await (0, contractkit_1.newKit)(opts.network);
    chainId = await kit.web3.eth.getChainId();
    const inputToken = tokenByAddrOrSymbol(opts.input);
    const outputToken = tokenByAddrOrSymbol(opts.output);
    const inputAmount = new bignumber_js_1.default(opts.amount).shiftedBy(inputToken.decimals);
    const tokenWhitelist = ubeswapTokens.tokens.filter((v) => v.chainId === chainId).map((v) => v.address);
    const registryFs = opts.registries === "all" ?
        Object.values(registriesByName) :
        opts.registries.split(",").map((x) => registriesByName[x]);
    const registries = registryFs.map((f) => f(kit));
    const manager = new swappa_manager_1.SwappaManager(kit, mainnet_SwappaRouterV1_addr_json_1.address, registries);
    console.info(`Finding & initializing pairs...`);
    const pairs = await manager.reinitializePairs(tokenWhitelist);
    console.info(`Pairs (${pairs.length}):`);
    for (const registry of registries) {
        for (const pair of manager.getPairsByRegistry(registry.getName())) {
            console.info(`${registry.getName().padEnd(12)}` +
                `${(_a = pair.constructor) === null || _a === void 0 ? void 0 : _a.name}:${pair.pairKey}: ` +
                `${tokenByAddrOrSymbol(pair.tokenA).symbol} / ${tokenByAddrOrSymbol(pair.tokenB).symbol}` +
                `\n  snapshot: ${JSON.stringify(pair.snapshot())}`);
        }
    }
    console.info(`--------------------------------------------------------------------------------`);
    console.info(`Routes: ${inputAmount.shiftedBy(-inputToken.decimals)} ${inputToken.symbol} ${inputToken.address} -> ${outputToken.symbol} ${outputToken.address}...`);
    const startT0 = Date.now();
    if (opts.benchmark && parseInt(opts.benchmark) > 0) {
        // run the benchmark
        const benchIterations = parseInt(opts.benchmark);
        console.info(`Benchmarking for ${benchIterations} iterations`);
        for (let i = 0; i < benchIterations; i++) {
            manager.findBestRoutesForFixedInputAmount(inputToken.address, outputToken.address, inputAmount, {
                maxSwaps: opts.maxSwaps || undefined,
            });
        }
        const elapsed = Date.now() - startT0;
        console.info(`Benchmark elapsed ${elapsed / 1000}s, ${elapsed / benchIterations}ms per iteration`);
    }
    const routes = manager.findBestRoutesForFixedInputAmount(inputToken.address, outputToken.address, inputAmount, {
        maxSwaps: opts.maxSwaps || undefined,
    });
    console.info(`Top 5 routes (elapsed: ${Date.now() - startT0}ms):`);
    for (const route of routes.slice(0, 5)) {
        const path = route.pairs.map((p, idx) => `${tokenByAddrOrSymbol(route.path[idx]).symbol}:${p.constructor.name}`);
        console.info(`Output: ${route.outputAmount.shiftedBy(-(outputToken.decimals || 18)).toFixed(10)} -- ` +
            `${path.join(":")}:${outputToken.symbol}`);
    }
    const from = opts.from;
    if (from && routes.length > 0) {
        const route = routes[0];
        const inputTKN = new kit.web3.eth.Contract(IERC20_1.ABI, route.path[0]);
        const allowance = await inputTKN.methods.allowance(from, manager.routerAddr).call();
        if (inputAmount.gt(allowance)) {
            const approveTX = (0, connect_1.toTransactionObject)(kit.connection, inputTKN.methods.approve(manager.routerAddr, inputAmount.toFixed(0)));
            console.info(`Sending approve TX...`);
            const approveReceipt = await approveTX.sendAndWaitForReceipt({ from: from });
            console.info(`TX Done: ${approveReceipt.transactionHash}`);
        }
        const precheck = !opts.noPrecheck;
        const tx = manager.swap(route, inputAmount, route.outputAmount.multipliedBy(opts.maxSlippage), from, { precheckOutputAmount: precheck });
        console.info(`Sending TX...`);
        const receipt = await tx.sendAndWaitForReceipt({ from: from });
        console.info(`TX Done: ${receipt.transactionHash}`);
    }
}
main();
//# sourceMappingURL=cli.js.map