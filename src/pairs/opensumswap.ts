import BigNumber from "bignumber.js";
import type Web3 from "web3";

import { address as pairOpenSumSwapAddress } from "../../tools/deployed/mainnet.PairOpenSumSwap.addr.json";
import type { IOpenSumSwap } from "../../types/web3-v1-contracts/IOpenSumSwap";
import { ABI as SwapABI } from "../../types/web3-v1-contracts/IOpenSumSwap";
import type { MultiCallPayload } from "../multicall";
import type { Address, BigNumberString, Snapshot } from "../pair";
import { Pair } from "../pair";
import { selectAddress } from "../utils";

interface PairOpenSumSwapSnapshot extends Snapshot {
  paused: boolean;
  balances: BigNumberString[];
}

const ZERO = new BigNumber(0);

export class PairOpenSumSwap extends Pair {
  allowRepeats = false;
  private swapPool: IOpenSumSwap;

  private paused = false;
  private balances: BigNumber[] = [];

  constructor(chainId: number, web3: Web3, private swapPoolAddr: Address) {
    super(selectAddress(chainId, { mainnet: pairOpenSumSwapAddress }));
    this.swapPool = new web3.eth.Contract(
      SwapABI,
      swapPoolAddr
    ) as unknown as IOpenSumSwap;
  }

  protected async _init() {
    const [tokenA, tokenB] = await Promise.all([
      this.swapPool.methods.getToken(0).call(),
      this.swapPool.methods.getToken(1).call(),
    ]);
    return {
      pairKey: this.swapPoolAddr,
      tokenA,
      tokenB,
    };
  }

  async refresh() {
    const [paused, balances] = await Promise.all([
      this.swapPool.methods.paused().call(),
      this.swapPool.methods.getBalances().call(),
    ]);
    if (balances.length !== 2) {
      throw new Error("pool must have only 2 tokens!");
    }
    this.paused = paused;
    this.balances = balances.map((b) => new BigNumber(b));
  }

  outputAmount(inputToken: Address, inputAmount: BigNumber): BigNumber {
    if (this.paused) {
      return ZERO;
    }
    if (inputToken === this.tokenA && inputAmount.gt(this.balances[1])) {
      // not enough for conversion
      return ZERO;
    } else if (inputToken === this.tokenB && inputAmount.gt(this.balances[0])) {
      // not enough for conversion
      return ZERO;
    }
    return inputAmount;
  }

  reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair {
    return this.copy();
  }

  protected swapExtraData() {
    return this.swapPoolAddr;
  }

  snapshot(): PairOpenSumSwapSnapshot {
    return {
      paused: this.paused,
      balances: this.balances.map((b) => b.toFixed()),
    };
  }

  depositAmount(amountA: BigNumber, amountB: BigNumber): BigNumber {
    return new BigNumber(0);
  }

  withdrawAmount(lpAmount: BigNumber): BigNumber[] {
    return [];
  }

  restore(snapshot: PairOpenSumSwapSnapshot): void {
    this.paused = snapshot.paused;
    this.balances = snapshot.balances.map((b) => new BigNumber(b));
  }

  getMulticallPayloadForBootstrap(): MultiCallPayload[] {
    return [];
  }
}
