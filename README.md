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

## Verified release and current on-chain state

- **Network:** Ethereum Sepolia (chain ID `11155111`); this is a testnet deployment, not Ethereum mainnet.
- **Deployment:** `MiniVault` was created on 2026-11-10 at [0x601491dace86294f9dfc3adcff3c739ae5aa4a1c](https://sepolia.etherscan.io/address/0x601491dace86294f9dfc3adcff3c739ae5aa4a1c).
- **Source verification:** fully verified on [Blockscout](https://eth-sepolia.blockscout.com/address/0x601491dace86294f9dfc3adcff3c739ae5aa4a1c) on 2026-11-11 at 13:06:39 UTC. Explorer metadata reports Solidity `0.8.24`, optimizer enabled, 200 runs, and fully verified source.
- **Successful transaction exercise:** the explorer records a successful `0.001 ETH` deposit at 2026-11-11 12:39:36 UTC ([transaction](https://eth-sepolia.blockscout.com/tx/0x7ee2021f1679af80ff3b66ee4758e9b76bf9da6d201f78fc213b96297a9f0af8)) followed by a successful `0.001 ETH` withdrawal at 12:40:24 UTC ([transaction](https://eth-sepolia.blockscout.com/tx/0x8dc8f8a21688e198cf53c02757ded734ad908f52e7fb3082ac3836ddaf435b0e)).
- **Latest state checked:** `totalDeposits()` returned `0` and the tested wallet's recorded vault balance returned `0` when queried on 2026-11-11. This is a completed deposit/withdrawal test cycle, not evidence of ongoing TVL or active customer funds. The explorer also records earlier out-of-gas attempts during initial testing; subsequent deposit and withdrawal transactions succeeded.
- **Automated validation:** the repository CI passed on the current main commit, including the TypeScript/Vite production build, Foundry build and Foundry tests ([CI run](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/runs/43026016645)). The manual source-verification workflow also completed successfully ([verification run](https://github.com/ReignnRule11/Mini-DeFi-Vault/actions/runs/43026117198)).
- The frontend listens for wallet account and chain changes, clears stale balance displays, checks the active account/network before submitting transactions, and confirms transaction receipts before reporting success.

This is a functional educational testnet dApp with a verified contract source and a tested deposit/withdrawal flow. **It has not undergone an independent security audit and is not approved for real funds or production financial use.**

## Security

This is an educational testnet project, not audited software. Passing tests and successful Sepolia transactions do not constitute an independent security audit. Use Sepolia test ETH only; do not deposit real funds.
