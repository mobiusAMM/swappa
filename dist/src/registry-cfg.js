"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainnetRegistriesWhitelist = exports.mainnetRegistrySymmetric = exports.mainnetRegistryCeloDex = exports.mainnetRegistryMoolaV2 = exports.mainnetRegistrySavingsCELO = exports.mainnetRegistryMisc = exports.mainnetRegistryMobius = exports.mainnetRegistrySushiswap = exports.mainnetRegistryUbeswap = exports.mainnetRegistryMoola = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const savingscelo_1 = require("@terminal-fi/savingscelo");
const savingscelo_2 = require("./pairs/savingscelo");
const stableswap_1 = require("./pairs/stableswap");
const opensumswap_1 = require("./pairs/opensumswap");
const symmetricswap_1 = require("./pairs/symmetricswap");
const aave_1 = require("./registries/aave");
const aave_v2_1 = require("./registries/aave-v2");
const mento_1 = require("./registries/mento");
const static_1 = require("./registries/static");
const uniswapv2_1 = require("./registries/uniswapv2");
const balancer_1 = require("./registries/balancer");
const mainnetRegistryMoola = (kit) => new aave_1.RegistryAave("moola", kit, "0x7AAaD5a5fa74Aec83b74C2a098FBC86E17Ce4aEA");
exports.mainnetRegistryMoola = mainnetRegistryMoola;
const mainnetRegistryUbeswap = (kit) => new uniswapv2_1.RegistryUniswapV2("ubeswap", kit.web3, "0x62d5b84bE28a183aBB507E125B384122D2C25fAE");
exports.mainnetRegistryUbeswap = mainnetRegistryUbeswap;
const mainnetRegistrySushiswap = (kit) => new uniswapv2_1.RegistryUniswapV2("sushiswap", kit.web3, "0xc35DADB65012eC5796536bD9864eD8773aBc74C4");
exports.mainnetRegistrySushiswap = mainnetRegistrySushiswap;
const mainnetRegistryMobius = (kit) => {
    const web3 = kit.web3;
    return new static_1.RegistryStatic("mobius", web3.eth.getChainId().then(chainId => [
        // Source: https://github.com/mobiusAMM/mobiusV1
        new stableswap_1.PairStableSwap(chainId, web3, "0x0ff04189Ef135b6541E56f7C638489De92E9c778"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xdBF27fD2a702Cc02ac7aCF0aea376db780D53247"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xE0F2cc70E52f05eDb383313393d88Df2937DA55a"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x19260b9b573569dDB105780176547875fE9fedA3"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xA5037661989789d0310aC2B796fa78F1B01F195D"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x2080AAa167e2225e1FC9923250bA60E19a180Fb2"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x63C1914bf00A9b395A2bF89aaDa55A5615A3656e"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x382Ed834c6b7dBD10E4798B08889eaEd1455E820"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x413FfCc28e6cDDE7e93625Ef4742810fE9738578"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x02Db089fb09Fda92e05e92aFcd41D9AAfE9C7C7C"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x0986B42F5f9C42FeEef66fC23eba9ea1164C916D"),
        // Opticsv2: https://github.com/mobiusAMM/mobius-interface/blob/main/src/constants/StablePools.ts
        new stableswap_1.PairStableSwap(chainId, web3, "0x9906589Ea8fd27504974b7e8201DF5bBdE986b03"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xF3f65dFe0c8c8f2986da0FEc159ABE6fd4E700B4"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x74ef28D635c6C5800DD3Cd62d4c4f8752DaACB09"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xaEFc4e8cF655a182E8346B24c8AbcE45616eE0d2"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xcCe0d62Ce14FB3e4363Eb92Db37Ff3630836c252"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xa2F0E57d4cEAcF025E81C76f28b9Ad6E9Fbe8735"),
        new stableswap_1.PairStableSwap(chainId, web3, "0xFc9e2C63370D8deb3521922a7B2b60f4Cff7e75a"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x23C95678862a229fAC088bd9705622d78130bC3e"),
        new stableswap_1.PairStableSwap(chainId, web3, "0x9F4AdBD0af281C69a582eB2E6fa2A594D4204CAe"), // cUSD <-> atUST
    ]));
};
exports.mainnetRegistryMobius = mainnetRegistryMobius;
const mainnetRegistryMisc = (kit) => {
    const web3 = kit.web3;
    return new static_1.RegistryStatic("misc", web3.eth.getChainId().then(chainId => [
        // Optics V1 <-> V2 migration
        new opensumswap_1.PairOpenSumSwap(chainId, web3, "0xb1a0BDe36341065cA916c9f5619aCA82A43659A3"),
        new opensumswap_1.PairOpenSumSwap(chainId, web3, "0xd5ab1BA8b2Ec70752068d1d728e728eAd0E19CBA"),
        new opensumswap_1.PairOpenSumSwap(chainId, web3, "0x70bfA1C8Ab4e42B9BE74f65941EFb6e5308148c7"),
        // Symmetric V1 <-> V2 migration
        new symmetricswap_1.PairSymmetricSwap(chainId, web3, "0xF21150EC57c360dA61cE7900dbaFdE9884198026", "0x7c64aD5F9804458B8c9F93f7300c15D55956Ac2a", "0x8427bD503dd3169cCC9aFF7326c15258Bc305478")
    ]));
};
exports.mainnetRegistryMisc = mainnetRegistryMisc;
const mainnetRegistrySavingsCELO = (kit) => new static_1.RegistryStatic("savingscelo", web3.eth.getChainId().then(chainId => [
    new savingscelo_2.PairSavingsCELO(chainId, kit, savingscelo_1.SavingsCELOAddressMainnet),
]));
exports.mainnetRegistrySavingsCELO = mainnetRegistrySavingsCELO;
const mainnetRegistryMoolaV2 = (kit) => new aave_v2_1.RegistryAaveV2("moola-v2", kit.web3, "0xD1088091A174d33412a968Fa34Cb67131188B332");
exports.mainnetRegistryMoolaV2 = mainnetRegistryMoolaV2;
const mainnetRegistryCeloDex = (kit) => new uniswapv2_1.RegistryUniswapV2("celodex", kit.web3, "0x31bD38d982ccDf3C2D95aF45a3456d319f0Ee1b6", {
    fixedFee: new bignumber_js_1.default(0.997),
    fetchUsingAllPairs: true,
});
exports.mainnetRegistryCeloDex = mainnetRegistryCeloDex;
const mainnetRegistrySymmetric = (kit) => new balancer_1.RegistryBalancer("symmetric", kit.web3, "0x3E30b138ecc85cD89210e1A19a8603544A917372");
exports.mainnetRegistrySymmetric = mainnetRegistrySymmetric;
// mainnetRegistriesWhitelist contains list of more established protocols with
// overall higher TVL.
const mainnetRegistriesWhitelist = (kit) => ([
    new mento_1.RegistryMento(kit),
    // Uniswap forks:
    (0, exports.mainnetRegistryUbeswap)(kit),
    (0, exports.mainnetRegistrySushiswap)(kit),
    // Stableswap forks:
    (0, exports.mainnetRegistryMobius)(kit),
    // Balancer forks:
    (0, exports.mainnetRegistrySymmetric)(kit),
    // Direct conversion protocols:
    (0, exports.mainnetRegistryMoola)(kit),
    (0, exports.mainnetRegistryMoolaV2)(kit),
    (0, exports.mainnetRegistryMisc)(kit),
]);
exports.mainnetRegistriesWhitelist = mainnetRegistriesWhitelist;
//# sourceMappingURL=registry-cfg.js.map