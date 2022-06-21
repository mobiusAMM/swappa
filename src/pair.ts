import BigNumber from "bignumber.js";
import { MultiCallPayload } from "./multicall";

export type Address = string;

export abstract class Snapshot {}
export interface BootInfo {
  tokenA: Address;
  tokenB: Address;
  poolAddress: Address;
  pairKey?: string;
  lpToken?: Address;
  lpSupply?: BigNumberString;
}
export type BigNumberString = string;

export interface SwapData {
  addr: string;
  extra: string;
}

export interface DepositData {
  addr: string;
  extra: string;
}

export interface PairDescriptor extends BootInfo {
  _type:
    | "atoken-v2"
    | "atoken"
    | "stableswap"
    | "balancer-v1"
    | "uni-v2"
    | "general";
}

export abstract class Pair {
  // pairKey is used to identify conflicting pairs. In a single route, every non-null pairKey must
  // be unique. On the otherhand, Pair-s with null pairKey can be used unlimited amount of times in
  // a single route.
  public pairKey: string | null = null;
  public tokenA: Address = "";
  public tokenB: Address = "";
  public lpToken?: Address;
  public lpSupply: BigNumber = new BigNumber(0);
  private swappaPairAddress: Address = "";
  private depositAddress: Address = "";

  constructor(swappaPairAddress: Address, depositAddress: Address = "") {
    this.swappaPairAddress = swappaPairAddress;
    this.depositAddress = depositAddress;
  }

  public copy(): Pair {
    return Object.create(this);
  }

  public async init(): Promise<void> {
    const r = await this._init();
    this.pairKey = r.pairKey;
    this.tokenA = r.tokenA;
    this.tokenB = r.tokenB;
    return this.refresh();
  }

  abstract reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair;

  protected abstract _init(): Promise<{
    pairKey: string | null;
    tokenA: Address;
    tokenB: Address;
  }>;
  public abstract refresh(): Promise<void>;
  public swapData(inputToken: Address): SwapData {
    return {
      addr: this.swappaPairAddress,
      extra: this.swapExtraData(inputToken),
    };
  }

  public depositData(): DepositData {
    return {
      addr: this.depositAddress,
      extra: this.depositExtraData(),
    };
  }

  protected abstract swapExtraData(inputToken: Address): string;
  protected depositExtraData(): string {
    return "";
  }
  public abstract outputAmount(
    inputToken: Address,
    inputAmount: BigNumber
  ): BigNumber;

  public async loadLpAddress() {
    return true;
  }

  public depositAmount(amountA: BigNumber, amountB: BigNumber): BigNumber {
    return new BigNumber(0);
  }

  public withdrawAmount(lpAmount: BigNumber): BigNumber[] {
    return [];
  }

  public get canDepositOneSided(): boolean {
    return false;
  }

  public abstract snapshot(): Snapshot;
  public abstract restore(snapshot: Snapshot): void;
  public bootstrap({ tokenA, tokenB, pairKey, lpToken, lpSupply }: BootInfo) {
    this.pairKey = pairKey ?? this.pairKey;
    this.tokenA = tokenA ?? this.tokenA;
    this.tokenB = tokenB ?? this.tokenB;
    this.lpToken = lpToken ?? this.lpToken;
    this.lpSupply = lpSupply ? new BigNumber(lpSupply) : this.lpSupply;
  }
  public getDescriptor(): PairDescriptor {
    return {
      _type: "general",
      tokenA: this.tokenA,
      tokenB: this.tokenB,
      poolAddress: "",
      lpToken: this.lpToken,
      pairKey: this.pairKey ?? undefined,
    };
  }
  public abstract getMulticallPayloadForBootstrap(): MultiCallPayload[];
}

interface PairXYeqKSnapshot extends Snapshot {
  fee: BigNumberString;
  bucketA: BigNumberString;
  bucketB: BigNumberString;
}

export interface PairXYeqKBootInfo extends BootInfo {
  fee: BigNumberString;
  bucketA: BigNumberString;
  bucketB: BigNumberString;
}

export abstract class PairXYeqK extends Pair {
  private fee: BigNumber = new BigNumber(0);
  protected bucketA: BigNumber = new BigNumber(0);
  protected bucketB: BigNumber = new BigNumber(0);

  public refreshBuckets(
    fee: BigNumber,
    bucketA: BigNumber,
    bucketB: BigNumber
  ) {
    this.fee = fee;
    this.bucketA = bucketA;
    this.bucketB = bucketB;
  }

  reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair {
    const copy = this.copy() as PairXYeqK;
    copy.bucketA = copy.bucketA.plus(liquidityChanges[0]);
    copy.bucketB = copy.bucketB.plus(liquidityChanges[1]);
    return copy;
  }

  public outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber {
    const buckets =
      inputToken === this.tokenA
        ? [this.bucketA, this.bucketB]
        : inputToken === this.tokenB
        ? [this.bucketB, this.bucketA]
        : null;
    if (buckets === null) {
      throw new Error(
        `unsupported input: ${inputToken}, pair: ${this.tokenA}/${this.tokenB}!`
      );
    }
    if (this.bucketA.lt(1) || this.bucketB.lt(1)) {
      return new BigNumber(0);
    }
    const amountWithFee = inputAmount.multipliedBy(this.fee);
    const outputAmount = buckets[1]
      .multipliedBy(amountWithFee)
      .dividedToIntegerBy(buckets[0].plus(amountWithFee));
    return !outputAmount.isNaN() ? outputAmount : new BigNumber(0);
  }

  public inputAmount(outputToken: Address, outputAmount: BigNumber): BigNumber {
    const buckets =
      outputToken === this.tokenB
        ? [this.bucketA, this.bucketB]
        : outputToken === this.tokenA
        ? [this.bucketB, this.bucketA]
        : null;
    if (buckets === null) {
      throw new Error(
        `unsupported output: ${outputToken}, pair: ${this.tokenA}/${this.tokenB}!`
      );
    }
    return buckets[0]
      .multipliedBy(outputAmount)
      .div(buckets[1].minus(outputAmount).multipliedBy(this.fee));
  }

  public depositAmount(amountA: BigNumber, amountB: BigNumber): BigNumber {
    const amount0 = amountA.multipliedBy(this.lpSupply).dividedBy(this.bucketA);
    const amount1 = amountB.multipliedBy(this.lpSupply).dividedBy(this.bucketB);
    return amount0.lte(amount1) ? amount0 : amount1;
  }

  public withdrawAmount(lpAmount: BigNumber): BigNumber[] {
    const multiplier = lpAmount.dividedBy(this.lpSupply);
    return [
      this.bucketA.multipliedBy(multiplier),
      this.bucketB.multipliedBy(multiplier),
    ];
  }

  public snapshot(): PairXYeqKSnapshot {
    return {
      fee: this.fee.toFixed(),
      bucketA: this.bucketA.toFixed(),
      bucketB: this.bucketB.toFixed(),
    };
  }

  public restore(snapshot: PairXYeqKSnapshot): void {
    this.fee = snapshot.fee ? new BigNumber(snapshot.fee) : this.fee;
    this.bucketA = new BigNumber(snapshot.bucketA);
    this.bucketB = new BigNumber(snapshot.bucketB);
  }

  public bootstrap({
    bucketA,
    bucketB,
    fee,
    ...rest
  }: PairXYeqKBootInfo): void {
    super.bootstrap(rest);
    this.restore({ fee, bucketA, bucketB });
  }
}
