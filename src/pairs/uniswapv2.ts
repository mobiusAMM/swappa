import BigNumber from "bignumber.js";
import type Web3 from "web3";

import { address as pairUniswapV2Address } from "../../tools/deployed/mainnet.PairUniswapV2.addr.json";
import { ABI as Erc20ABI } from "../../types/web3-v1-contracts/ERC20";
import type { IUniswapV2Pair } from "../../types/web3-v1-contracts/IUniswapV2Pair";
import { ABI as PairABI } from "../../types/web3-v1-contracts/IUniswapV2Pair";
import type { MultiCallPayload } from "../multicall";
import type {
  Address,
  BigNumberString,
  PairDescriptor,
  PairXYeqKBootInfo,
} from "../pair";
import { PairXYeqK } from "../pair";
import { selectAddress, UniV2Interface } from "../utils";

export interface PairUniswapBootInfo extends PairXYeqKBootInfo {
  reserves: BigNumberString[];
}

export class PairUniswapV2 extends PairXYeqK {
  allowRepeats = false;

  private pair: IUniswapV2Pair;
  private feeKData: string;
  private decimals = [18, 18];

  constructor(
    private chainId: number,
    private web3: Web3,
    private pairAddr: Address,
    private fixedFee: BigNumber = new BigNumber(0.997),
    lp?: Address
  ) {
    super(selectAddress(chainId, { mainnet: pairUniswapV2Address }));
    this.lpToken = lp;
    this.pair = new this.web3.eth.Contract(
      PairABI,
      pairAddr
    ) as unknown as IUniswapV2Pair;
    const feeKInv = new BigNumber(1000).minus(this.fixedFee.multipliedBy(1000));
    if (!feeKInv.isInteger() || !feeKInv.gt(0) || !feeKInv.lt(100)) {
      throw new Error(`Invalid fixedFee: ${this.fixedFee}!`);
    }
    this.feeKData = feeKInv.toString(16).padStart(2, "0");
  }

  protected async _init() {
    const [tokenA, tokenB] = await Promise.all([
      this.pair.methods.token0().call(),
      this.pair.methods.token1().call(),
    ]);
    const tokenAContract = new this.web3.eth.Contract(Erc20ABI, tokenA);
    const tokenBContract = new this.web3.eth.Contract(Erc20ABI, tokenB);

    this.decimals = await Promise.all([
      tokenAContract.methods.decimals().call(),
      tokenBContract.methods.decimals().call(),
    ]);

    return {
      pairKey: this.pairAddr,
      tokenA,
      tokenB,
    };
  }

  async refresh(): Promise<void> {
    if (!this.pair) {
      throw new Error(`not initialized!`);
    }
    const reserves = await this.pair.methods.getReserves().call();
    this.refreshBuckets(
      this.fixedFee,
      new BigNumber(reserves[0]),
      new BigNumber(reserves[1])
    );
  }

  protected swapExtraData() {
    return `${this.pair.options.address}${this.feeKData}`;
  }

  protected depositExtraData(): string {
    return this.swapExtraData();
  }

  bootstrap({ reserves, ...rest }: PairUniswapBootInfo): void {
    super.bootstrap({
      ...rest,
      bucketA: reserves[0],
      bucketB: reserves[1],
      fee: this.fixedFee.toFixed(),
    });
  }

  loadLpAddress(): Promise<boolean> {
    this.lpToken = this.pairAddr;
    return new Promise((res) => res(true));
  }

  getDescriptor(): PairDescriptor {
    const TEN = new BigNumber("10");
    const liquidityA = this.bucketA.div(TEN.pow(this.decimals[0]));
    const liquidityB = this.bucketB.div(TEN.pow(this.decimals[1]));
    const hide =
      liquidityA.isLessThanOrEqualTo("1000") &&
      liquidityB.isLessThanOrEqualTo("1000");
    return {
      ...super.getDescriptor(),
      _type: hide ? "general" : "uni-v2",
      poolAddress: this.pairAddr,
      lpToken: this.lpToken,
    };
  }

  getMulticallPayloadForBootstrap(): MultiCallPayload[] {
    return [
      {
        fieldName: "reserves",
        targetInterface: UniV2Interface,
        target: this.pairAddr,
        method: "getReserves",
        transformResult: (r) => [r[0].toString(), r[1].toString()],
      },
    ];
  }
}
