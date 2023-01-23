import {
  BigInt,
  Bytes,
  Entity,
  ethereum,
  Value,
} from "@graphprotocol/graph-ts";
import { Bundle } from "../generated/schema";
import { ZERO_BI, ONE_BI } from "./constants";

export function generateTransactionId(event: ethereum.Event): string {
  let blockHash = event.block.hash.toHexString();
  let txHash = event.transaction.hash.toHexString();
  let logIndex = event.logIndex.toString();
  return blockHash + "-" + txHash + "-" + logIndex;
}

/**
 * Set all metadata for an entity such as block number, timestamp.
 */
export function setMetaDataFields(entity: Entity, event: ethereum.Event): void {
  entity.set("txHash", Value.fromString(event.transaction.hash.toHexString()));
  entity.set("block", Value.fromBigInt(event.block.number));
  entity.set("timestamp", Value.fromBigInt(event.block.timestamp));
}

export function getNextSyncingIndex(collection: string): BigInt {
  let bundle = Bundle.load(collection);
  if (!bundle) {
    bundle = new Bundle(collection);
    bundle.syncingIndex = BigInt.fromI32(0);
  }
  let newSyncingIndex = bundle.syncingIndex.plus(ONE_BI);
  bundle.syncingIndex = newSyncingIndex;
  bundle.save();

  return newSyncingIndex;
}

export function setSyncingIndex(collection: string, entity: Entity): void {
  let syncingIndex = getNextSyncingIndex(collection);
  entity.set("syncingIndex", Value.fromBigInt(syncingIndex));
}

export function abs(number: BigInt): BigInt {
  if (number.lt(ZERO_BI)) {
    number = ZERO_BI.minus(number);
  }
  return number;
}

export function max(a: BigInt, b: BigInt): BigInt {
  if (a.ge(b)) return a;
  return b;
}
