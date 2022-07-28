import type Web3 from "web3";

import type { ILendingPoolAddressesProviderV2 } from "../../types/web3-v1-contracts/ILendingPoolAddressesProviderV2";
import { ABI as ILendingPoolAddressesProviderV2ABI } from "../../types/web3-v1-contracts/ILendingPoolAddressesProviderV2";
import type { ILendingPoolV2 } from "../../types/web3-v1-contracts/ILendingPoolV2";
import { ABI as ILendingPoolV2ABI } from "../../types/web3-v1-contracts/ILendingPoolV2";
import type { Address } from "../pair";
import { PairATokenV2 } from "../pairs/atoken-v2";
import { Registry } from "../registry";
import { initPairsAndFilterByWhitelist } from "../utils";

export class RegistryAaveV2 extends Registry {
  private provider: ILendingPoolAddressesProviderV2;

  constructor(
    name: string,
    private web3: Web3,
    lendingPoolAddrProviderAddr: string
  ) {
    super(name);
    this.provider = new web3.eth.Contract(
      ILendingPoolAddressesProviderV2ABI,
      lendingPoolAddrProviderAddr
    ) as unknown as ILendingPoolAddressesProviderV2;
  }

  findPairs = async (tokenWhitelist: Address[]) => {
    const chainId = await this.web3.eth.getChainId();
    const poolAddr: string = await this.provider.methods
      .getLendingPool()
      .call();
    const lendingPool: ILendingPoolV2 = new this.web3.eth.Contract(
      ILendingPoolV2ABI,
      poolAddr
    ) as unknown as ILendingPoolV2;
    const reserves: Address[] = await lendingPool.methods
      .getReservesList()
      .call();
    const reservesMatched = reserves.filter(
      (r) => tokenWhitelist.indexOf(r) >= 0
    );
    const pairs = reservesMatched.map(
      (r) => new PairATokenV2(chainId, this.web3, poolAddr, r)
    );
    return initPairsAndFilterByWhitelist(pairs, tokenWhitelist);
  };
}
