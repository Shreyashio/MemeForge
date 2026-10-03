export const TOKEN_FACTORY_ABI = [
  {
    "type": "function",
    "name": "createToken",
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "symbol", "type": "string" },
      { "name": "supply", "type": "uint256" },
      { "name": "whitepaperCid", "type": "string" }
    ],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "TokenCreated",
    "inputs": [
      { "name": "token", "type": "address", "indexed": true },
      { "name": "creator", "type": "address", "indexed": true },
      { "name": "name", "type": "string", "indexed": false },
      { "name": "symbol", "type": "string", "indexed": false },
      { "name": "whitepaperCid", "type": "string", "indexed": false }
    ],
    "anonymous": false
  }
] as const;
