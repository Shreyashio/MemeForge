import { keccak256, toBytes } from "viem";

export function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function computeWhitepaperHash(whitepaper: object): string {
  const json = JSON.stringify(whitepaper);
  return keccak256(toBytes(json));
}
