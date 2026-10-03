# MemeForge 🪙

> **Satire. Testnet only. Not financial advice.**

MemeForge takes your dumbest crypto idea and generates a fully designed fake crypto project complete with a landing page, whitepaper, tokenomics chart, and a real ERC-20 token you can deploy on Base Sepolia testnet.

---

## Table of Contents

- [What it does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Smart Contract (Foundry)](#smart-contract-foundry)
- [Deploying the Factory](#deploying-the-factory)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## What it does

1. User types a dumb coin idea (e.g. *"A coin for people who forget their crypto password"*)
2. MemeForge calls an LLM to generate a full fake crypto project as JSON
3. A themed landing page is generated at `/p/{id}` with:
   - Hero section with generated logo SVG, tagline, and CTA
   - Features, tokenomics pie chart, roadmap, team section
   - Live fake holders/market cap counters
   - A "Deploy this token" button (Base Sepolia)
4. A printable whitepaper is available at `/p/{id}/whitepaper`
5. Clicking "Deploy" calls the on-chain `TokenFactory` contract which mints 1 billion ERC-20 tokens to your wallet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 |
| Wallet | wagmi v3 · viem · Base Sepolia |
| LLM | Gemma / Llama via OpenAI-compatible endpoint (Groq) |
| Smart Contract | Foundry · Solidity ^0.8.20 · OpenZeppelin ERC20 |
| Storage | Flat JSON files in `/data/projects/` |

---

## Setup

### Prerequisites

- **Node.js** v18+ and **npm**
- A **Groq API key** (free at [console.groq.com](https://console.groq.com)) — or any OpenAI-compatible endpoint
- **Foundry** (for contract work): install from [getfoundry.sh](https://getfoundry.sh)
- A browser wallet (MetaMask etc.) with Base Sepolia testnet added

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
GEMMA_BASE_URL=https://api.groq.com/openai/v1
GEMMA_MODEL=llama-3.1-8b-instant
GEMMA_API_KEY=gsk_your_groq_key_here

# Leave as zero until you deploy the factory (see below)
NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
```

---

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The dev script uses `--webpack` flag because Turbopack requires native SWC bindings unavailable in some environments. This is handled automatically.

---

## Smart Contract (Foundry)

The contracts live in `/contracts`. The factory deploys a new `MemeToken` (ERC-20) for each project.

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install contract dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
```

### Run tests

```bash
cd contracts
forge test -vvv
```

Expected output:

```
[PASS] testCreateToken()
[PASS] testCreateTokenEmitsEvent()
[PASS] testMultipleDeployments()
[PASS] testSupplyMintedToCreator()
```

### Build / compile

```bash
cd contracts
forge build
```

---

## Deploying the Factory

### Prerequisites

- Get Base Sepolia ETH from [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
- Set your private key and RPC URL in `.env.local`:

```env
PRIVATE_KEY=0xabc123...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Deploy command

```bash
cd contracts

forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

The script will print the deployed factory address. Copy it into your `.env.local`:

```env
NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

Restart the dev server — the "Deploy this token" button on project pages will now work.

### Verify on Basescan (optional)

```bash
forge verify-contract \
  <DEPLOYED_ADDRESS> \
  src/TokenFactory.sol:TokenFactory \
  --chain base-sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMMA_BASE_URL` | Yes | OpenAI-compatible base URL (e.g. `https://api.groq.com/openai/v1`) |
| `GEMMA_MODEL` | Yes | Model name (e.g. `llama-3.1-8b-instant`) |
| `GEMMA_API_KEY` | Yes | API key for the LLM provider |
| `NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS` | Optional | Deployed `TokenFactory` address on Base Sepolia. Set to zero address if not yet deployed — the Deploy button will show an informative error. |
| `PRIVATE_KEY` | Foundry only | Deployer wallet private key (never commit!) |
| `BASE_SEPOLIA_RPC_URL` | Foundry only | Base Sepolia RPC URL |

---

## Project Structure

```
memeforge/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home: idea input
│   │   ├── layout.tsx                  # Root layout + providers
│   │   ├── providers.tsx               # wagmi + react-query
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── generate/route.ts       # POST /api/generate
│   │   │   └── projects/[id]/route.ts  # GET/PATCH /api/projects/:id
│   │   └── p/
│   │       └── [id]/
│   │           ├── page.tsx            # Generated landing page
│   │           └── whitepaper/page.tsx # Printable whitepaper
│   └── lib/
│       ├── gemma.ts                    # LLM client
│       ├── schema.ts                   # Zod schema
│       ├── contracts.ts                # TokenFactory ABI
│       └── utils.ts                    # Helpers + keccak hash
├── contracts/
│   ├── src/
│   │   ├── TokenFactory.sol
│   │   └── MemeToken.sol
│   ├── test/TokenFactory.t.sol
│   ├── script/DeployFactory.s.sol
│   ├── remappings.txt
│   └── foundry.toml
├── data/projects/                      # Generated project JSON files
├── .env.example
└── README.md
```

---

## How it works

1. **LLM generation**: System prompt instructs the model to be a deadpan corporate crypto parody generator and return only valid JSON. Response is stripped of markdown fences, parsed, and validated with Zod. Up to 2 retries on invalid JSON.

2. **Storage**: Each project saved as `data/projects/{timestamp}-{random}.json`. No database.

3. **Whitepaper hash**: `keccak256(JSON.stringify(whitepaper))` computed client-side with viem and passed on-chain as `whitepaperCid`. Tamper-evident fingerprint without IPFS.

4. **Token deployment**: Factory deploys a new minimal ERC-20 (OpenZeppelin) minting 1 billion tokens to `msg.sender`. `TokenCreated` event is parsed from the receipt to get the token address, then saved back to the project JSON so page reloads show it.

---

*Built for Hacktober 2026. All generated projects are satire.*
