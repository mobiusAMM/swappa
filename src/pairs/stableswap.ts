import Web3 from "web3";
import BigNumber from "bignumber.js";
import { Result } from "@ethersproject/abi";
import { ISwap, ABI as SwapABI } from "../../types/web3-v1-contracts/ISwap";
import { Erc20, ABI as Erc20ABI } from "../../types/web3-v1-contracts/ERC20";

import { encodePacked } from "web3-utils";

import {
  Address,
  Pair,
  Snapshot,
  BigNumberString,
  BootInfo,
  PairDescriptor,
} from "../pair";
import { ERC20Interface, selectAddress, StableSwapInterface } from "../utils";
import { address as pairStableSwapAddress } from "../../tools/deployed/mainnet.PairStableSwap.addr.json";
import { address as depositStableSwapAddress } from "../../tools/deployed/mainnet.DepositStableSwap.addr.json";
import {
  convertResultToBigNumber,
  convertResultToString,
  MultiCallPayload,
} from "../multicall";
import invariant from "tiny-invariant";

interface PairStableSwapSnapshot extends Snapshot {
  paused: boolean;
  tokenPrecisionMultipliers?: BigNumberString[];
  balancesWithAdjustedPrecision?: BigNumberString[];
  swapFee: BigNumberString;
  preciseA: BigNumberString;
}

export interface PairStableSwapBootInfo extends BootInfo {
  fee: BigNumberString;
  paused: boolean;
  decimals: number[];
  balances: BigNumber[];
  swapFee: BigNumberString;
  preciseA: BigNumberString;
  gaugeAddress?: Address;
}

export class PairStableSwap extends Pair {
  allowRepeats = false;
  private swapPool: ISwap;

  private paused: boolean = false;
  private gaugeAddress?: Address;
  private tokenPrecisionMultipliers: BigNumber[] = [];
  private balancesWithAdjustedPrecision: BigNumber[] = [];
  private swapFee: BigNumber = new BigNumber(0);
  private preciseA: BigNumber = new BigNumber(0);
  private decimals = [18, 18];

  static readonly POOL_PRECISION_DECIMALS = 18;
  static readonly A_PRECISION = 100;

  constructor(
    chainId: number,
    private web3: Web3,
    private swapPoolAddr: Address,
    lp?: Address
  ) {
    super(
      selectAddress(chainId, { mainnet: pairStableSwapAddress }),
      selectAddress(chainId, { mainnet: depositStableSwapAddress })
    );
    this.lpToken = lp;
    this.swapPool = new web3.eth.Contract(
      SwapABI,
      swapPoolAddr
    ) as unknown as ISwap;
  }

  protected async _init() {
    const [tokenA, tokenB] = await Promise.all([
      this.swapPool.methods.getToken(0).call(),
      this.swapPool.methods.getToken(1).call(),
    ]);
    const erc20A = new this.web3.eth.Contract(
      Erc20ABI,
      tokenA
    ) as unknown as Erc20;
    const erc20B = new this.web3.eth.Contract(
      Erc20ABI,
      tokenB
    ) as unknown as Erc20;
    const [decimalsA, decimalsB] = await Promise.all([
      erc20A.methods.decimals().call(),
      erc20B.methods.decimals().call(),
    ]);
    this.decimals = [parseInt(decimalsA), parseInt(decimalsB)];
    this.tokenPrecisionMultipliers = [
      new BigNumber(10).pow(
        PairStableSwap.POOL_PRECISION_DECIMALS - Number.parseInt(decimalsA)
      ),
      new BigNumber(10).pow(
        PairStableSwap.POOL_PRECISION_DECIMALS - Number.parseInt(decimalsB)
      ),
    ];
    return {
      pairKey: this.swapPoolAddr,
      tokenA,
      tokenB,
    };
  }

  public get canDepositOneSided(): boolean {
    return true;
  }

  public async loadLpAddress(): Promise<boolean> {
    this.lpToken = await this.swapPool.methods.getLpToken().call();
    return true;
  }

  reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair {
    const copy = this.copy() as PairStableSwap;
    copy.balancesWithAdjustedPrecision = copy.balancesWithAdjustedPrecision.map(
      (el, i) =>
        el.plus(liquidityChanges[i].times(this.tokenPrecisionMultipliers[i]))
    );
    return copy;
  }

  public async refresh() {
    const [paused, balances, swapFee, preciseA] = await Promise.all([
      this.swapPool.methods.paused().call(),
      this.swapPool.methods.getBalances().call(),
      this.swapPool.methods.getSwapFee().call(),
      this.swapPool.methods.getAPrecise().call(),
    ]);
    if (balances.length !== 2) {
      throw new Error("pool must have only 2 tokens!");
    }
    this.paused = paused;
    this.balancesWithAdjustedPrecision = balances.map((b, idx) =>
      this.tokenPrecisionMultipliers[idx].multipliedBy(b)
    );
    this.swapFee = new BigNumber(swapFee).div(new BigNumber(10).pow(10));
    this.preciseA = new BigNumber(preciseA);
  }

  public outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber {
    if (this.paused) {
      return new BigNumber(0);
    }

    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L617
    const [tokenIndexFrom, tokenIndexTo] =
      inputToken === this.tokenA ? [0, 1] : [1, 0];
    const x = inputAmount
      .multipliedBy(this.tokenPrecisionMultipliers[tokenIndexFrom])
      .plus(this.balancesWithAdjustedPrecision[tokenIndexFrom]);
    const y = this.getY(x, this.balancesWithAdjustedPrecision, this.preciseA);
    const outputAmountWithFee = this.balancesWithAdjustedPrecision[tokenIndexTo]
      .minus(y)
      .minus(1);
    const fee = outputAmountWithFee.multipliedBy(this.swapFee);
    const outputAmount = outputAmountWithFee
      .minus(fee)
      .div(this.tokenPrecisionMultipliers[tokenIndexTo])
      .integerValue();
    return outputAmount;
  }

  private getY = (x: BigNumber, xp: BigNumber[], a: BigNumber) => {
    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L531
    const d = this.getD(xp, a);
    const nTokens = xp.length;
    const nA = a.multipliedBy(nTokens);

    const s = x;
    const c = d
      .multipliedBy(d)
      .div(x.multipliedBy(nTokens))
      .integerValue()
      .multipliedBy(d)
      .multipliedBy(PairStableSwap.A_PRECISION)
      .div(nA.multipliedBy(nTokens))
      .integerValue();
    const b = s
      .plus(d.multipliedBy(PairStableSwap.A_PRECISION).div(nA))
      .integerValue();

    let yPrev;
    let y = d;
    for (let i = 0; i < 256; i++) {
      yPrev = y;
      y = y
        .multipliedBy(y)
        .plus(c)
        .div(y.multipliedBy(2).plus(b).minus(d))
        .integerValue();
      if (y.minus(yPrev).abs().lte(1)) {
        return y;
      }
    }
    throw new Error("SwapPool approximation did not converge!");
  };

  private getD(xp: BigNumber[], a: BigNumber) {
    // See: https://github.com/mobiusAMM/mobiusV1/blob/master/contracts/SwapUtils.sol#L393
    const s = BigNumber.sum(...xp);
    if (s.eq(0)) {
      return s;
    }

    let prevD;
    let d = s;
    const nTokens = xp.length;
    const nA = a.multipliedBy(nTokens);

    for (let i = 0; i < 256; i++) {
      let dP = d;
      xp.forEach((x) => {
        dP = dP.multipliedBy(d).div(x.multipliedBy(nTokens)).integerValue();
      });
      prevD = d;
      d = nA
        .multipliedBy(s)
        .div(PairStableSwap.A_PRECISION)
        .plus(dP.multipliedBy(nTokens))
        .multipliedBy(d)
        .div(
          nA
            .minus(PairStableSwap.A_PRECISION)
            .multipliedBy(d)
            .div(PairStableSwap.A_PRECISION)
            .plus(new BigNumber(nTokens).plus(1).multipliedBy(dP))
        )
        .integerValue();
      if (d.minus(prevD).abs().lte(1)) {
        return d;
      }
    }
    throw new Error("SwapPool D does not converge!");
  }

  protected swapExtraData() {
    return this.swapPoolAddr;
  }

  protected depositExtraData(): string {
    return (
      encodePacked(
        {
          value: this.swapPoolAddr,
          type: "address",
        },
        {
          value: this.gaugeAddress ?? "",
          type: "address",
        }
      ) ?? `${this.swapPoolAddr}${this.gaugeAddress}`
    );
  }

  public snapshot(): PairStableSwapSnapshot {
    return {
      paused: this.paused,
      tokenPrecisionMultipliers: this.tokenPrecisionMultipliers.map((n) =>
        n.toFixed()
      ),
      balancesWithAdjustedPrecision: this.balancesWithAdjustedPrecision.map(
        (n) => n.toFixed()
      ),
      swapFee: this.swapFee.toFixed(),
      preciseA: this.preciseA.toFixed(),
    };
  }

  // https://github.com/mobiusAMM/mobiusV1/blob/75eb17d390e28c91e640c82d5610191d5852cbb4/contracts/SwapUtils.sol#L866
  public depositAmount(amountA: BigNumber, amountB: BigNumber): BigNumber {
    const amounts = [amountA, amountB];
    const lpSupply = this.lpSupply;
    const newBalances = this.balancesWithAdjustedPrecision.map((el, i) =>
      el.plus(amounts[i].times(this.tokenPrecisionMultipliers[i]))
    );
    const [d0, d1] = [
      this.getD(this.balancesWithAdjustedPrecision, this.preciseA),
      this.getD(newBalances, this.preciseA),
    ];
    return d1.minus(d0).times(lpSupply).div(d0);
  }

  public withdrawAmount(lpAmount: BigNumber): BigNumber[] {
    const multiplier = lpAmount.dividedBy(this.lpSupply);
    return this.balancesWithAdjustedPrecision.map((bal, i) =>
      bal.multipliedBy(multiplier).div(this.tokenPrecisionMultipliers[i])
    );
  }

  public restore(snapshot: PairStableSwapSnapshot): void {
    this.paused = snapshot.paused;
    this.swapFee = new BigNumber(snapshot.swapFee);
    this.preciseA = new BigNumber(snapshot.preciseA);

    this.tokenPrecisionMultipliers =
      this.tokenPrecisionMultipliers ??
      snapshot.tokenPrecisionMultipliers?.map((r) => new BigNumber(r));
    this.balancesWithAdjustedPrecision =
      this.balancesWithAdjustedPrecision ??
      snapshot.balancesWithAdjustedPrecision?.map((r) => new BigNumber(r));
  }

  public bootstrap({
    tokenA,
    tokenB,
    pairKey,
    poolAddress,
    lpSupply,
    lpToken,
    gaugeAddress,
    ...rest
  }: PairStableSwapBootInfo): void {
    this.tokenPrecisionMultipliers =
      rest.decimals?.map((dec) =>
        new BigNumber(10).pow(PairStableSwap.POOL_PRECISION_DECIMALS - dec)
      ) ?? this.tokenPrecisionMultipliers;
    this.balancesWithAdjustedPrecision = rest.balances.map((b, idx) =>
      this.tokenPrecisionMultipliers[idx].multipliedBy(b)
    );
    this.gaugeAddress = gaugeAddress ?? this.gaugeAddress;

    super.bootstrap({
      tokenA,
      tokenB,
      pairKey,
      poolAddress,
      lpSupply,
      lpToken,
    });
    this.restore(rest);
  }

  public getMulticallPayloadForBootstrap(): MultiCallPayload[] {
    invariant(this.lpToken, "No lp token supplied");
    const template = {
      targetInterface: StableSwapInterface,
      target: this.swapPoolAddr,
    };
    const callInfo = [
      {
        fieldName: "paused",
        method: "paused",
        transformResult: (r: Result) => !!r[0],
      },

      {
        fieldName: "swapFee",
        method: "getSwapFee",
        transformResult: (r: Result) =>
          new BigNumber(r[0].toString())
            .dividedBy(new BigNumber("10").pow(10))
            .toFixed(),
      },
      {
        fieldName: "balances",
        method: "getBalances",
        transformResult: (r: Result) => r[0].map((el: string) => el.toString()),
      },
      {
        fieldName: "preciseA",
        method: "getAPrecise",
        transformResult: convertResultToString,
      },
      {
        fieldName: "lpSupply",
        targetInterface: ERC20Interface,
        target: this.lpToken,
        method: "totalSupply",
        transformResult: convertResultToBigNumber,
      },
    ];
    return callInfo.map((el) => ({ ...template, ...el }));
  }

  public getDescriptor(): PairDescriptor {
    return {
      ...super.getDescriptor(),
      _type: "stableswap",
      poolAddress: this.swapPoolAddr,
      decimals: this.decimals,
    } as PairDescriptor;
  }
}
