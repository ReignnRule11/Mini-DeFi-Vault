# Mini DeFi Vault

[![CI](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml/badge.svg)](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/workflows/ci.yml)

A React + Vite dApp for depositing and withdrawing Sepolia test ETH from a personal MiniVault smart contract.

## Stack

- Solidity 0.8.24, OpenZeppelin, Foundry
- React, TypeScript, Vite, viem
- Sepolia testnet
- GitHub Pages frontend hosting

## Smart contract

Deployed MiniVault contract on Sepolia:

`0x601491dace86294f9dfc3adcff3c739ae5aa4a1c`

[View contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x601491dace86294f9dfc3adcff3c739ae5aa4a1c)

## Local setup

```bash
npm install
npm run build
```

Create a local `.env.local` file with:

```env
VITE_VAULT_ADDRESS=0x601491dace86294f9dfc3adcff3c739ae5aa4a1c
VITE_SEPOLIA_CHAIN_ID=11155111
```

Do not commit `.env.local`, private keys, or seed phrases.

For the Solidity toolchain, install Foundry and run:

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
forge build
forge test
```

## GitHub Pages deployment

The frontend is built and published by `.github/workflows/deploy-pages.yml`.

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Create a repository variable named `VITE_VAULT_ADDRESS` with the deployed contract address above. This is a public contract address, not a secret.
3. Open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
4. Open **Actions → Deploy frontend to GitHub Pages**, select **Run workflow**, and run it on `main`.

The published site URL will be:

[https://reignnrule11.github.io/Mini-DeFi-Vault/](https://reignnrule11.github.io/Mini-DeFi-Vault/)

## Sepolia deployment

The smart-contract deployment workflow is separate from frontend publishing. It uses the repository Actions secrets `PRIVATE_KEY` and `SEPOLIA_RPC_URL`. Never put either value in frontend environment variables or commit them to the repository.

## Security

This is an educational testnet project, not audited software. Use Sepolia test ETH only; do not deposit real funds.
