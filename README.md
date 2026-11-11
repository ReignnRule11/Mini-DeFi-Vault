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

For reproducible Solidity builds, use Foundry 1.9.0, Solidity 0.8.24, and the exact dependency revisions used for deployment:

```bash
forge install OpenZeppelin/openzeppelin-contracts@cab19933c33c2ad1d4c7a84864a3601dddfd16f3
forge install foundry-rs/forge-std@f3dae6e6ee381f25eb6a246f7da9b85c91a68219
forge build
forge test
```

The compiler optimizer is enabled with 200 runs in `foundry.toml`. The **Verify MiniVault on Sepolia** workflow submits the existing deployment for Blockscout source verification; it does not redeploy the contract.

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

## Test coverage

The Foundry suite covers:

- Deposit and withdrawal accounting, including contract ETH balance consistency
- Deposit and withdrawal event emission
- Per-user balance isolation and unauthorized withdrawals
- Rejection of zero-value deposits and zero-amount withdrawals
- Reentrancy protection during withdrawal callbacks

Run the suite with `forge test -vv` after installing the Foundry dependencies.

## Release verification status

- Sepolia deployment and manual deposit/withdrawal flows have been exercised.
- On-chain aggregate accounting (`address(vault).balance == totalDeposits()`) and the connected user's recorded balance have been manually compared and matched.
- The deployed address is currently reported as **unverified** by Blockscout. Verify the source on an explorer using the exact compiler settings and dependency versions before treating the deployment as source-verified.
- The frontend listens for wallet account and chain changes, clears stale balance displays, and checks the active account/network again before submitting transactions.
- CI runs the TypeScript/Vite build and Foundry contract build/tests. The unused, unconfigured Hardhat test file has been removed so the documented test path is unambiguous.

## Security

This is an educational testnet project, not audited software. Passing tests and successful Sepolia transactions do not constitute an independent security audit. Use Sepolia test ETH only; do not deposit real funds.
