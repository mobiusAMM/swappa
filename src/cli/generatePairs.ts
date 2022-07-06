#!/usr/bin/env node
import commander from "commander";
import { ContractKit, newKit } from "@celo/contractkit";

import * as ubeswapTokens from "@ubeswap/default-token-list/ubeswap-experimental.token-list.json";
import { address as swappaRouterV1Address } from "../../tools/deployed/mainnet.SwappaRouterV1.addr.json";
import { SwappaManager } from "../swappa-manager";
import {
  mainnetRegistryMobius,
  mainnetRegistryMoolaV2,
  mainnetRegistrySushiswap,
  mainnetRegistryUbeswap,
} from "../registry-cfg";
import { Registry } from "../registry";
import Web3 from "web3";
import fs from "fs";

const registriesByName: { [name: string]: (kit: ContractKit) => Registry } = {
  // mento: (kit: ContractKit) => new RegistryMento(kit),
  ubeswap: mainnetRegistryUbeswap,
  sushiswap: mainnetRegistrySushiswap,
  mobius: mainnetRegistryMobius,
  // moola: mainnetRegistryMoola,
  "moola-v2": mainnetRegistryMoolaV2,
  // savingscelo: mainnetRegistrySavingsCELO,
  // celodex: mainnetRegistryCeloDex,
  // symmetric: mainnetRegistrySymmetric,
  // misc: mainnetRegistryMisc,
};

let chainId: number;

function tokenByAddrOrSymbol(addressOrSymbol: string) {
  const t = ubeswapTokens.tokens.find(
    (t) =>
      t.chainId === chainId &&
      (t.address === addressOrSymbol || t.symbol === addressOrSymbol)
  );
  if (!t) {
    throw new Error(`Unrecognized token: ${addressOrSymbol}!`);
  }
  return t;
}

async function main() {
  const kit = await newKit("https://forno.celo.org");
  chainId = await kit.web3.eth.getChainId();

  const tokenWhitelist = ubeswapTokens.tokens
    .filter((v) => v.chainId === chainId)
    .map((v) => v.address);
  const registries = Object.values(registriesByName).map((f) => f(kit));
  const web3 = new Web3(
    new Web3.providers.HttpProvider("https://forno.celo.org")
  );
  const manager = new SwappaManager(
    kit,
    swappaRouterV1Address,
    registries,
    web3
  );
  const pairs = await manager.reinitializePairs([
    ...tokenWhitelist,
    "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd",
    "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941",
    "0xCD7D7Ff64746C1909E44Db8e95331F9316478817",
  ]);
  await Promise.all(pairs.map((p) => p.loadLpAddress()));
  const descriptors = manager.getPairDescriptors();

  fs.writeFileSync("descriptors.json", JSON.stringify(descriptors));
}

main();
