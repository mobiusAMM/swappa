import { Address, Pair } from "./pair";
export declare abstract class Registry {
    private name;
    constructor(name: string);
    getName(): string;
    abstract findPairs(tokenWhitelist: Address[]): Promise<Pair[]>;
}
