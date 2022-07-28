import type { Address, Pair } from "./pair";

export abstract class Registry {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  abstract findPairs(tokenWhitelist: Address[]): Promise<Pair[]>;
}
