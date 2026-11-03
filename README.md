# Mini DeFi Vault

[![CI](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml/badge.svg)](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml)

A full-stack Ethereum dApp for depositing and withdrawing test ETH from a personal vault on Sepolia.

## Stack
- Solidity 0.8.24, OpenZeppelin, Foundry
- React, TypeScript, Vite, viem
- Sepolia testnet; Vercel frontend hosting

## Status
Foundry build/tests are configured. The contract must be deployed to Sepolia and its address configured before the live dApp can transact.

## Setup
```bash
npm install
npm run build
```

For the Solidity toolchain, install Foundry and run:
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
forge build
forge test
```

Set `VITE_VAULT_ADDRESS` only after deploying the contract. Never commit private keys or seed phrases.

## Sepolia deployment
Set these environment variables locally (never commit them):
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY`

Then run:
```bash
forge script script/DeployMiniVault.s.sol:DeployMiniVault --rpc-url $SEPOLIA_RPC_URL --broadcast
```

Or:
```bash
npm run deploy:sepolia
```

The deployment script returns the newly deployed `MiniVault` address. Use that address as `VITE_VAULT_ADDRESS` in Vercel.

## Vercel
Build command: `npm run build`; output directory: `dist`. Add `VITE_VAULT_ADDRESS` as a project environment variable after contract deployment, then redeploy.

## Security
This is an educational testnet project, not audited software. Use test ETH only.
