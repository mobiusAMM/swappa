import { Contract } from "@celo/connect";
import { Interface, Result } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import MULTICALL_ABI from "./abi.json";
import { AbiItem } from "web3-utils";
import { Address } from "../pair";
import warning from "tiny-warning";
import invariant from "tiny-invariant";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { chunkArray } from "../utils";

export const MULTI_CALL = "0x75f59534dd892c1f8a7b172d639fa854d529ada3"; // TODO: Extend to multichain

export interface MultiCallPayload {
  fieldName: string; // TODO: Better enforce this type.  Should only be a field name of the bootstrap objects
  targetInterface: Interface;
  target: string;
  method: string;
  transformResult?: (res: Result) => any;
  data?: any[];
}

export async function multicallMultipleContractMultipleData(
  web3: Web3,
  payload: MultiCallPayload[]
) {
  const multicallContract = new web3.eth.Contract(
    MULTICALL_ABI as AbiItem[],
    MULTI_CALL
  );
  const calls: [string, string][] = payload.map(
    ({ targetInterface, target, method, data }) => {
      const fragment = targetInterface.getFunction(method);
      const call = [
        target,
        targetInterface.encodeFunctionData(fragment, data ?? []),
      ];
      return call as [string, string];
    }
  );
  const chunkedCalls = chunkArray(calls, Math.ceil(calls.length / 2));

  const results = await Promise.all(
    chunkedCalls.map((call) => multicallContract.methods.aggregate(call).call())
  );
  const returnData = results.flatMap((el) => el.returnData as string[]);
  return returnData.map((res, i) => {
    const { targetInterface, method, transformResult } = payload[i];
    const fragment = targetInterface.getFunction(method);
    const decodedResult = targetInterface.decodeFunctionResult(fragment, res);
    const result = transformResult
      ? transformResult(decodedResult)
      : decodedResult;
    return result;
  });
}

export async function multicallMultipleContractSingleData(
  targetInterface: Interface,
  targets: string[],
  method: string,
  data?: any[]
) {
  const multicallContract = new Contract(
    MULTICALL_ABI as AbiItem[],
    MULTI_CALL
  );
  const fragment = targetInterface.getFunction(method);
  const calls = targets.map((target) => [
    target,
    targetInterface.encodeFunctionData(fragment, data),
  ]);
  const { returnData }: { returnData: string[] } =
    await multicallContract.methods.aggregate(calls).call();
  return returnData.map((el) =>
    targetInterface.decodeFunctionResult(fragment, el)
  );
}

/**
 *
 * @param address string to check if an address is valid and checksummed
 * @returns checksummed address, or undefined if address is invalid
 */
export function validateAndParseAddress(address: string): Address {
  let checksummedAddress = "" as Address;
  try {
    checksummedAddress = getAddress(address);
    warning(address === checksummedAddress, `${address} is not checksummed.`);
    return checksummedAddress;
  } catch (error) {
    invariant(false, `${address} is not a valid address.`);
  }
  return checksummedAddress;
}

/**
 *
 * @param result Result object from multicall
 * @param i index of value within Result, default 0
 * @returns string representation of ith value in Result
 */
export const convertResultToString = (result?: Result, i = 0) =>
  result?.[i].toString();

/**
 *
 * @param result Result object from multicall
 * @param i index of value within Result, default 0
 * @returns address of ith value in Result
 */
export const convertResultToAddress = (result?: Result, i = 0): Address =>
  validateAndParseAddress(convertResultToString(result, i));

/**
 *
 * @param result Result object from multicall
 * @param i index of value within Result, default 0
 * @returns BigNumber of ith value in Result
 */
export const convertResultToBigNumber = (result?: Result, i = 0): BigNumber =>
  new BigNumber(convertResultToString(result, i));

/**
 *
 * @param result Result object from multicall
 * @param i index of value within Result, default 0
 * @returns Number of ith value in Result
 */
export const convertResultToNumber = (result?: Result, i = 0) =>
  parseInt(convertResultToString(result, i));

/**
 *
 * @param txnHash Hash of transaction waiting to be mined
 * @param web3 web3 object
 * @returns status of the transaction (true = success, false = revert)
 */
export async function waitForMinedTransaction(txnHash: string, web3: Web3) {
  let receipt = await web3.eth.getTransactionReceipt(txnHash);
  while (!receipt) {
    await new Promise((r) => setTimeout(r, 5000));
    receipt = await web3.eth.getTransactionReceipt(txnHash);
  }
  return receipt.status;
}
