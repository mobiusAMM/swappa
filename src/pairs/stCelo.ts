import BigNumber from "bignumber.js";
import Web3 from "web3";

import { Address, BootInfo, Pair, PairDescriptor, Snapshot } from "../pair";
import {
  ChainId,
  selectAddress,
  StakedCeloAccountInterface,
  StakedCeloInterface,
} from "../utils";
import { convertResultToBigNumber, MultiCallPayload } from "../multicall";
import {
  IStakedCelo,
  ABI as StakedCeloABI,
} from "../../types/web3-v1-contracts/IStakedCelo";
import {
  IAccount,
  ABI as AccountABI,
} from "../../types/web3-v1-contracts/IAccount";
import { address as pairRstAddress } from "../../tools/deployed/mainnet.PairRStCelo.addr.json";
import { address as pairStAddress } from "../../tools/deployed/mainnet.PairStCelo.addr.json";

export interface PairStakedCeloDescriptor extends PairDescriptor {
  accountAddress: Address;
}

interface PairStakedCeloBootInfo extends BootInfo {
  stCeloSupply: BigNumber;
  celoBalance: BigNumber;
}

abstract class PairStakedCelo extends Pair {
  allowRepeats = true;

  private stCeloContract: IStakedCelo;
  private accountContract: IAccount;
  private stCeloSupply: BigNumber = new BigNumber(0);
  private celoBalance: BigNumber = new BigNumber(0);

  constructor(
    private web3: Web3,
    swappaPairAddress: Address,
    private stakedCeloAddress: Address,
    private accountAddress: Address
  ) {
    super(swappaPairAddress);
    this.stCeloContract = new this.web3.eth.Contract(
      StakedCeloABI,
      this.stakedCeloAddress
    ) as unknown as IStakedCelo;
    this.accountContract = new this.web3.eth.Contract(
      AccountABI,
      this.accountAddress
    ) as unknown as IAccount;
  }

  protected async _fetchSupplies() {
    const [stCeloSupply, celoBalace] = await Promise.all([
      this.stCeloContract.methods.totalSupply().call(),
      this.accountContract.methods.getTotalCelo().call(),
    ]);
    this.stCeloSupply = new BigNumber(stCeloSupply.toString());
    this.celoBalance = new BigNumber(celoBalace.toString());
  }
  public async refresh(): Promise<void> {}

  protected toStakedCelo(celoAmount: BigNumber): BigNumber {
    return celoAmount.times(this.stCeloSupply).div(this.celoBalance);
  }

  protected toCelo(stCeloAmount: BigNumber): BigNumber {
    return stCeloAmount.times(this.celoBalance).div(this.celoBalance);
  }

  public snapshot(): Snapshot {
    return {};
  }

  public restore(snapshot: Snapshot): void {
    // do nothing
  }

  public bootstrap({
    stCeloSupply,
    celoBalance,
    ...rest
  }: PairStakedCeloBootInfo): void {
    this.stCeloSupply = stCeloSupply;
    this.celoBalance = celoBalance;
    super.bootstrap(rest as BootInfo);
  }

  public getMulticallPayloadForBootstrap(): MultiCallPayload[] {
    return [
      {
        target: this.stakedCeloAddress,
        targetInterface: StakedCeloInterface,
        method: "totalSupply",
        transformResult: convertResultToBigNumber,
        fieldName: "stCeloSupply",
      },
      {
        target: this.accountAddress,
        targetInterface: StakedCeloAccountInterface,
        method: "getTotalCelo",
        transformResult: convertResultToBigNumber,
        fieldName: "celoBalance",
      },
    ];
  }

  public getDescriptor(): PairStakedCeloDescriptor {
    return {
      ...super.getDescriptor(),
      accountAddress: this.accountAddress,
    };
  }

  reflectLiquidityChanges(liquidityChanges: BigNumber[]): Pair {
    return this.copy();
  }
}

export interface PairStCeloDescriptor extends PairStakedCeloDescriptor {
  managerAddress: Address;
}

export class PairStCelo extends PairStakedCelo {
  private stCeloAddr: Address;
  constructor(
    chainId: ChainId,
    web3: Web3,
    accountAddress: Address,
    private managerAddress: Address,
    private celoAddr: Address,
    stCeloAddr: Address
  ) {
    super(
      web3,
      selectAddress(chainId, { mainnet: pairStAddress }),
      stCeloAddr,
      accountAddress
    );
    this.stCeloAddr = stCeloAddr;
    this.tokenA = this.celoAddr;
    this.tokenB = this.stCeloAddr;
  }

  protected async _init(): Promise<{
    pairKey: string | null;
    tokenA: string;
    tokenB: string;
  }> {
    await this._fetchSupplies();
    return {
      pairKey: this.managerAddress,
      tokenA: this.celoAddr,
      tokenB: this.stCeloAddr,
    };
  }

  public outputAmount(inputToken: string, inputAmount: BigNumber): BigNumber {
    if (inputToken === this.tokenB) return new BigNumber(0);
    return this.toStakedCelo(inputAmount);
  }

  protected swapExtraData(inputToken: string): string {
    return this.managerAddress;
  }

  public getDescriptor(): PairStCeloDescriptor {
    return {
      managerAddress: this.managerAddress,
      ...super.getDescriptor(),
    };
  }
}

interface PairRebasedStCeloDescriptor extends PairStakedCeloDescriptor {
  rebaserAddress: Address;
}

export class PairRebasedStCelo extends PairStakedCelo {
  private stCeloAddr: Address;

  constructor(
    chainId: ChainId,
    web3: Web3,
    accountAddress: Address,
    private rstCeloAddr: Address,
    stCeloAddr: Address
  ) {
    super(
      web3,
      selectAddress(chainId, { mainnet: pairRstAddress }),
      stCeloAddr,
      accountAddress
    );
    this.stCeloAddr = stCeloAddr;
    this.tokenA = this.rstCeloAddr;
    this.tokenB = this.stCeloAddr;
  }

  protected async _init(): Promise<{
    pairKey: string | null;
    tokenA: string;
    tokenB: string;
  }> {
    await this._fetchSupplies();
    return {
      pairKey: this.rstCeloAddr,
      tokenA: this.rstCeloAddr,
      tokenB: this.stCeloAddr,
    };
  }

  public outputAmount(inputToken: string, inputAmount: BigNumber): BigNumber {
    if (inputToken === this.tokenB) return this.toCelo(inputAmount);
    return this.toStakedCelo(inputAmount);
  }

  protected swapExtraData(inputToken: string): string {
    const swapType = inputToken === this.tokenA ? "01" : "02";

    return `${this.rstCeloAddr}${swapType}`;
  }

  public getDescriptor(): PairRebasedStCeloDescriptor {
    return {
      rebaserAddress: this.rstCeloAddr,
      ...super.getDescriptor(),
    };
  }
}
