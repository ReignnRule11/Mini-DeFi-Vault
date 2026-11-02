# Mini DeFi Vault


[![CI](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml/badge.svg)](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml)

A full-stack Ethereum dApp for depositing and withdrawing test ETH from a personal vault on Sepolia.

## Stack
- Solidity 0.8.24, OpenZeppelin, Hardhat
- React, TypeScript, Vite, viem
- Sepolia testnet; Vercel frontend hosting

## Status
Initial project scaffold. The contract must be deployed to Sepolia and its address configured before the live dApp can transact.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_VAULT_ADDRESS` only after deploying the contract. Never commit private keys or seed phrases.

## Contract
```bash
npm run compile
npm test
npm run deploy:sepolia
```

Required deployment variables: `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and optionally `ETHERSCAN_API_KEY`.

## Vercel
Import this repository into Vercel. Build command: `npm run build`; output directory: `dist`. Add `VITE_VAULT_ADDRESS` as a project environment variable after contract deployment.

## Security
This is an educational testnet project, not audited software. Use test ETH only.
