"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairMento = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const pair_1 = require("../pair");
const mainnet_PairMento_addr_json_1 = require("../../tools/deployed/mainnet.PairMento.addr.json");
const utils_1 = require("../utils");
class PairMento extends pair_1.PairXYeqK {
    constructor(chainId, kit, stableToken) {
        super((0, utils_1.selectAddress)(chainId, { mainnet: mainnet_PairMento_addr_json_1.address }));
        this.kit = kit;
        this.stableToken = stableToken;
        this.allowRepeats = false;
        this.mentoBucketsAfterUpdate = async () => {
            // ## from Exchange.sol:
            // function getUpdatedBuckets() private view returns (uint256, uint256) {
            // 	uint256 updatedGoldBucket = getUpdatedGoldBucket();
            // 	uint256 exchangeRateNumerator;
            // 	uint256 exchangeRateDenominator;
            // 	(exchangeRateNumerator, exchangeRateDenominator) = getOracleExchangeRate();
            // 	uint256 updatedStableBucket = exchangeRateNumerator.mul(updatedGoldBucket).div(
            // 		exchangeRateDenominator
            // 	);
            // 	return (updatedGoldBucket, updatedStableBucket);
            // }
            //
            // function getUpdatedGoldBucket() private view returns (uint256) {
            // 	uint256 reserveGoldBalance = getReserve().getUnfrozenReserveGoldBalance();
            // 	return reserveFraction.multiply(FixidityLib.newFixed(reserveGoldBalance)).fromFixed();
            // }
            const stableContract = this.kit.celoTokens.getContract(this.stableToken);
            const [reserveGoldBalance, reserveFraction, oracleRate,] = await Promise.all([
                this.reserve.getUnfrozenReserveCeloBalance(),
                this.exchange.reserveFraction(),
                this.sortedOracles.medianRate(stableContract),
            ]);
            const bucketCELO = reserveGoldBalance.multipliedBy(reserveFraction).integerValue(bignumber_js_1.default.ROUND_DOWN);
            const bucketSTB = bucketCELO.multipliedBy(oracleRate.rate).integerValue(bignumber_js_1.default.ROUND_DOWN);
            return { bucketCELO, bucketSTB };
        };
    }
    async _init() {
        const celo = await this.kit.contracts.getGoldToken();
        const cSTB = await this.kit.contracts.getStableToken(this.stableToken);
        this.exchange = await this.kit.contracts.getExchange(this.stableToken);
        this.reserve = await this.kit.contracts.getReserve();
        this.sortedOracles = await this.kit.contracts.getSortedOracles();
        return {
            pairKey: this.exchange.address,
            tokenA: celo.address,
            tokenB: cSTB.address,
        };
    }
    async refresh() {
        const [lastUpdateSecs, updateFrequencySecs, spread,] = await Promise.all([
            this.exchange.lastBucketUpdate(),
            this.exchange.updateFrequency(),
            this.exchange.spread(),
        ]);
        const tillUpdateSecs = lastUpdateSecs.plus(updateFrequencySecs).minus(Date.now() / 1000);
        let buckets;
        if (tillUpdateSecs.gt(0) && tillUpdateSecs.lte(5)) {
            // Next block will likely have bucket update. `getBuyAndSellBuckets` will be inaccurate
            // because block timestamp in next block will be 0-5 seconds in future.
            buckets = await this.mentoBucketsAfterUpdate();
        }
        else {
            const [bucketCELO, bucketSTB] = await this.exchange.getBuyAndSellBuckets(false);
            buckets = { bucketCELO, bucketSTB };
        }
        this.refreshBuckets(new bignumber_js_1.default(1).minus(spread), buckets.bucketCELO, buckets.bucketSTB);
    }
    swapExtraData() {
        return this.exchange.address;
    }
}
exports.PairMento = PairMento;
//# sourceMappingURL=mento.js.map