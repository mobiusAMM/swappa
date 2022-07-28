import type { CeloTransactionObject } from "@celo/connect";
import { toTransactionObject } from "@celo/connect";
import type { ContractKit } from "@celo/contractkit";
import { concurrentMap } from "@celo/utils/lib/async";
import type BigNumber from "bignumber.js";
import invariant from "tiny-invariant";
import type Web3 from "web3";

import type { SwappaRouterV1 } from "../types/web3-v1-contracts/SwappaRouterV1";
import { ABI as SwappaRouterABI } from "../types/web3-v1-contracts/SwappaRouterV1";
import type { MultiCallPayload } from "./multicall";
import { multicallMultipleContractMultipleData } from "./multicall";
import type { Address, BootInfo, Pair, PairDescriptor } from "./pair";
import { PairATokenV2 } from "./pairs/atoken-v2";
import { PairStableSwap } from "./pairs/stableswap";
import { PairSymmetricSwap } from "./pairs/symmetricswap";
import { PairUniswapV2 } from "./pairs/uniswapv2";
import type { Registry } from "./registry";
import type { Route, RouterOpts } from "./router";
import { findBestRoutesForFixedInputAmount } from "./router";

function parsePairTypeToPair(
  { _type: pairType, tokenA, tokenB, poolAddress, lpToken }: PairDescriptor,
  web3: Web3,
  chainId = 42220
): Pair | undefined {
  switch (pairType) {
    case "atoken-v2":
      return new PairATokenV2(chainId, web3, poolAddress, tokenB, tokenA);
    case "balancer-v1":
      return new PairSymmetricSwap(chainId, web3, poolAddress, tokenA, tokenB);
    case "stableswap":
      return new PairStableSwap(chainId, web3, poolAddress, lpToken);
    case "uni-v2":
      return new PairUniswapV2(chainId, web3, poolAddress, undefined, lpToken);
    default:
      return undefined;
  }
}

function addPairToMap(pairsByToken: Map<string, Pair[]>, pair: Pair) {
  for (const token of [pair.tokenA, pair.tokenB]) {
    const arr = pairsByToken.get(token);
    if (arr) arr.push(pair);
    else pairsByToken.set(token, [pair]);
  }
}

function calcIntervals(arrayLengths: number[]): [number, number][] {
  let last = 0;
  return arrayLengths.map((len) => {
    const interval = [last, last + len];
    last = last + len;
    return interval;
  }) as [number, number][];
}

export class SwappaManager {
  private pairs: Pair[] = [];
  private pairsByToken = new Map<string, Pair[]>();
  private pairsByRegistry = new Map<string, Pair[]>();
  private pairsByLP = new Map<string, Pair>();
  private multiCallData?: MultiCallPayload[];
  private multiCallPayloadSlice?: number[];
  private multicallIntervals: [number, number][] = [];

  constructor(
    private kit: ContractKit,
    readonly routerAddr: Address,
    private registries: Registry[],
    private web3: Web3
  ) {}

  bulkRefreshPairs = async (pairBootInfo?: PairDescriptor[]) => {
    let multicallData = this.multiCallData;
    const multiCallPayloadSlice =
      this.multiCallPayloadSlice ?? new Array(this.pairs.length);
    if (!multicallData) {
      multicallData = this.pairs.flatMap((pair, i) => {
        const payloads: MultiCallPayload[] =
          pair.getMulticallPayloadForBootstrap();
        multiCallPayloadSlice[i] = payloads.length;
        return payloads;
      });
      this.multiCallData = multicallData;
      this.multiCallPayloadSlice = multiCallPayloadSlice;
      this.multicallIntervals = calcIntervals(multiCallPayloadSlice);
    }
    const result = await multicallMultipleContractMultipleData(
      this.web3,
      multicallData
    );

    const concurrentRefresh = async (val: Pair, p: number) => {
      const [start, stop] = this.multicallIntervals[p];
      if (start === stop) return;

      const pair = this.pairs[p];
      const bootPayload: { [s: string]: any } = pairBootInfo?.[p] ?? {};
      for (let i = start; i < stop; i++) {
        bootPayload[this.multiCallData?.[i].fieldName ?? ""] = result[i];
      }
      pair.bootstrap(bootPayload as BootInfo);
    };
    await concurrentMap(50, this.pairs, concurrentRefresh);
  };

  bulkInitializePairs = async (pairBootInfo: PairDescriptor[]) => {
    this.pairs = pairBootInfo.map((info) => {
      const pair = parsePairTypeToPair(info, this.web3, 42220) as Pair;

      for (const token of [info.tokenA, info.tokenB]) {
        const arr = this.pairsByToken.get(token);
        if (arr) arr.push(pair);
        else this.pairsByToken.set(token, [pair]);
      }

      if (info.lpToken) {
        this.pairsByLP.set(info.lpToken, pair);
      }
      return pair;
    });
    await this.bulkRefreshPairs(pairBootInfo);
  };

  get allPairs(): Pair[] {
    return this.pairs;
  }

  supportsTokens = (tokenIn: Address, tokenOut?: Address) =>
    this.pairsByToken.has(tokenIn) &&
    (!tokenOut || this.pairsByToken.has(tokenOut));

  supportsLp = (lp: Address) => this.pairsByLP.has(lp);

  getPairForLP = (lp: Address) => this.pairsByLP.get(lp);

  filterSupportedTokens = (tokens: Address[]) =>
    tokens.filter((el) => !this.pairsByToken.has(el));

  reinitializePairs = async (tokenWhitelist: Address[]) => {
    this.pairsByRegistry = new Map<string, Pair[]>();
    const pairsAll = await concurrentMap(5, this.registries, (r) =>
      r.findPairs(tokenWhitelist).then((pairs) => {
        this.pairsByRegistry.set(r.getName(), pairs);
        return pairs;
      })
    );
    this.pairs = [];
    this.pairsByToken = new Map<string, Pair[]>();
    pairsAll.forEach((pairs) => {
      pairs.forEach((p) => {
        this.pairs.push(p);
        for (const token of [p.tokenA, p.tokenB]) {
          const x = this.pairsByToken.get(token);
          if (x) {
            x.push(p);
          } else {
            this.pairsByToken.set(token, [p]);
          }
        }
      });
    });
    this.multiCallData = undefined;
    this.multiCallPayloadSlice = undefined;
    this.multicallIntervals = [];
    return this.pairs;
  };

  refreshPairs = async () => {
    await concurrentMap(10, this.pairs, (p) => p.refresh());
    return this.pairs;
  };

  getDepositAmount = (
    lp: Address,
    inputAmount: BigNumber[],
    previousRoutes?: Route[]
  ) => {
    const pair = this.pairsByLP.get(lp);
    invariant(pair, `Pair does not exist for lp ${lp}`);
    for (const route of previousRoutes ?? []) {
      route.pairs.forEach((pair, i) => {
        if (pair.pairKey) {
          pair = pair.reflectLiquidityChanges(
            route.pathAmounts.slice(i, i + 2)
          );
        }
      });
    }
    return pair.depositAmount(inputAmount[0], inputAmount[1]);
  };

  getPairsWithLP = (): Pair[] => Array.from(this.pairsByLP.values());

  getWithdrawAmount = (lp: Address, amount: BigNumber) =>
    this.pairsByLP.get(lp)?.withdrawAmount(amount);

  findBestRoutesForFixedInputAmount = (
    inputToken: Address,
    outputToken: Address,
    inputAmount: BigNumber,
    opts?: RouterOpts
  ) => {
    return findBestRoutesForFixedInputAmount(
      this.pairsByToken,
      inputToken,
      outputToken,
      inputAmount,
      opts
    );
  };

  getPairsByRegistry(registry: string): Pair[] {
    return this.pairsByRegistry.get(registry) || [];
  }

  getPairDescriptors(): PairDescriptor[] {
    return this.pairs
      .map((el) => el.getDescriptor())
      .filter(({ _type }) => _type !== "general");
  }
}

export const swapTX = (
  kit: ContractKit,
  routerAddr: Address,
  route: {
    pairs: Pair[];
    path: Address[];
  },
  inputAmount: BigNumber,
  minOutputAmount: BigNumber,
  to: Address,
  opts?: {
    precheckOutputAmount?: boolean;
    deadlineMs?: number;
  }
): CeloTransactionObject<unknown> => {
  const router = new kit.web3.eth.Contract(
    SwappaRouterABI,
    routerAddr
  ) as unknown as SwappaRouterV1;
  const routeData = route.pairs.map((p, idx) => p.swapData(route.path[idx]));
  const deadlineMs = opts?.deadlineMs || Date.now() / 1000 + 60;
  const swapF = opts?.precheckOutputAmount
    ? router.methods.swapExactInputForOutputWithPrecheck
    : router.methods.swapExactInputForOutput;
  const tx = toTransactionObject(
    kit.connection,
    swapF(
      route.path,
      routeData.map((d) => d.addr),
      routeData.map((d) => d.extra),
      inputAmount.toFixed(0),
      minOutputAmount.toFixed(0),
      to,
      deadlineMs.toFixed(0)
    )
  );
  return tx;
};
