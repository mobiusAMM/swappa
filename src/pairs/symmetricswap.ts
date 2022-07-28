import BigNumber from "bignumber.js";
import type Web3 from "web3";

import { address as pairSymmetricSwapAddress } from "../../tools/deployed/mainnet.PairSymmetricSwap.addr.json";
import type { Ierc20 } from "../../types/web3-v1-contracts/IERC20";
import { ABI as Ierc20ABI } from "../../types/web3-v1-contracts/IERC20";
import type { ISymmetricSwap } from "../../types/web3-v1-contracts/ISymmetricSwap";
import { ABI as SwapABI } from "../../types/web3-v1-contracts/ISymmetricSwap";
import type { MultiCallPayload } from "../multicall";
import { convertResultToAddress, convertResultToBigNumber } from "../multicall";
import type {
  Address,
  BigNumberString,
  PairDescriptor,
  Snapshot,
} from "../pair";
import { Pair } from "../pair";
import { BalancerV1Interface, ERC20Interface, selectAddress } from "../utils";

interface PairSymmetricSwapSnapshot extends Snapshot {
  paused: boolean;
  balanceA: BigNumberString;
  balanceB: BigNumberString;
}

const ZERO = new BigNumber(0);

export class PairSymmetricSwap extends Pair {
  allowRepeats = false;
  private swapPool: ISymmetricSwap;

  private paused = false;
  private ercA: Ierc20;
  private ercB: Ierc20;
  private balanceA: BigNumber = ZERO;
  private balanceB: BigNumber = ZERO;

  constructor(
    chainId: number,
    web3: Web3,
    private swapPoolAddr: Address,
    public tokenA: Address,
    public tokenB: Address
  ) {
    super(selectAddress(chainId, { mainnet: pairSymmetricSwapAddress }));
    // Unfortunately SymmetricSwap contract doesn't expose token addresses that it stores,
    // thus they have to be hardcoded in the constructor and can't be fetched from swapPool
    // directly.
    this.swapPool = new web3.eth.Contract(
      SwapABI,
      swapPoolAddr
    ) as unknown as ISymmetricSwap;
    this.ercA = new web3.eth.Contract(Ierc20ABI, tokenA) as unknown as Ierc20;
    this.ercB = new web3.eth.Contract(Ierc20ABI, tokenB) as unknown as Ierc20;
  }

  protected async _init() {
    return {
      pairKey: this.swapPoolAddr,
      tokenA: this.tokenA,
      tokenB: this.tokenB,
    };
  }

  reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair {
    const copy = this.copy() as PairSymmetricSwap;
    copy.balanceA = copy.balanceA.plus(liquidityChanges[0]);
    copy.balanceB = copy.balanceB.plus(liquidityChanges[1]);
    return copy;
  }

  async refresh() {
    let balanceA, balanceB;
    [this.paused, balanceA, balanceB] = await Promise.all([
      this.swapPool.methods.paused().call(),
      this.ercA.methods.balanceOf(this.swapPoolAddr).call(),
      this.ercB.methods.balanceOf(this.swapPoolAddr).call(),
    ]);
    this.balanceA = new BigNumber(balanceA);
    this.balanceB = new BigNumber(balanceB);
  }

  outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber {
    if (this.paused) {
      return ZERO;
    }

    let outputBalance;
    if (inputToken === this.tokenA) {
      outputBalance = this.balanceB;
    } else if (inputToken === this.tokenB) {
      outputBalance = this.balanceA;
    } else {
      // invalid input token
      return ZERO;
    }

    if (outputBalance.lt(inputAmount)) {
      return ZERO;
    }

    return inputAmount;
  }

  protected swapExtraData() {
    return this.swapPoolAddr;
  }

  snapshot(): PairSymmetricSwapSnapshot {
    return {
      paused: this.paused,
      balanceA: this.balanceA.toFixed(),
      balanceB: this.balanceB.toFixed(),
    };
  }

  getDescriptor(): PairDescriptor {
    return {
      ...super.getDescriptor(),
      _type: "balancer-v1",
      poolAddress: this.swapPoolAddr,
    };
  }

  restore(snapshot: PairSymmetricSwapSnapshot): void {
    this.paused = snapshot.paused;
    this.balanceA = new BigNumber(snapshot.balanceA);
    this.balanceB = new BigNumber(snapshot.balanceB);
  }

  depositAmount(amountA: BigNumber, amountB: BigNumber): BigNumber {
    return new BigNumber(0);
  }

  withdrawAmount(lpAmount: BigNumber): BigNumber[] {
    return [];
  }

  getMulticallPayloadForBootstrap(): MultiCallPayload[] {
    return [
      {
        fieldName: "balanceA",
        targetInterface: ERC20Interface,
        method: "balanceOf",
        target: this.tokenA,
        transformResult: convertResultToBigNumber,
      },
      {
        fieldName: "balanceB",
        targetInterface: ERC20Interface,
        method: "balanceOf",
        target: this.tokenB,
        transformResult: convertResultToBigNumber,
      },
      {
        fieldName: "paused",
        targetInterface: BalancerV1Interface,
        method: "paused",
        target: this.swapPoolAddr,
        transformResult: convertResultToAddress,
      },
    ];
  }
}
