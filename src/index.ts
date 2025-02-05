export * from "./swappa-manager";
export * from "./pair";
export * from "./registry";
export * from "./router";
export * from "./registries/static";
export * from "./registries/aave";
export * from "./registries/mento";
export * from "./registries/uniswapv2";
export * from "./registry-cfg";
export { address as swappaRouterV1Address } from "../tools/deployed/mainnet.SwappaRouterV1.addr.json";
export {
  SwappaRouterV1,
  ABI as SwappaRouterV1ABI,
} from "../types/web3-v1-contracts/SwappaRouterV1";
