import { Address, Pair } from "./pair";
export declare const initPairsAndFilterByWhitelist: (pairs: Pair[], tokenWhitelist: Address[]) => Promise<Pair[]>;
interface AddressesByNetwork {
    mainnet?: Address;
    baklava?: Address;
    alfajores?: Address;
}
export declare const selectAddress: (chainId: number, addresses: AddressesByNetwork) => string;
export {};
