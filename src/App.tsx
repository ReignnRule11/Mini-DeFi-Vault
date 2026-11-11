import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, formatEther, http, parseEther, type Address } from "viem";
import { sepolia } from "viem/chains";

const address = import.meta.env.VITE_VAULT_ADDRESS as Address | undefined;
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const abi = [
  { type:"function", name:"deposit", stateMutability:"payable", inputs:[], outputs:[] },
  { type:"function", name:"withdraw", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[] },
  { type:"function", name:"getBalance", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{type:"uint256"}] },
  { type:"function", name:"totalDeposits", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] }
] as const;

const publicClient = createPublicClient({ chain:sepolia, transport:http() });

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<any>;
  on?(event: string, handler: (...args: any[]) => void): void;
  removeListener?(event: string, handler: (...args: any[]) => void): void;
};

declare global { interface Window { ethereum?: EthereumProvider } }

export default function App() {
  const [account,setAccount] = useState<Address>();
  const [amount,setAmount] = useState("0.01");
  const [balance,setBalance] = useState("—");
  const [tvl,setTvl] = useState("—");
  const [status,setStatus] = useState("Connect your wallet to begin.");
  const [busy,setBusy] = useState(false);

  const refresh = async (who=account) => {
    if (!address || !who) {
      setBalance("—");
      return;
    }
    try {
      const [b,t] = await Promise.all([
        publicClient.readContract({address,abi,functionName:"getBalance",args:[who]}),
        publicClient.readContract({address,abi,functionName:"totalDeposits"})
      ]);
      setBalance(formatEther(b));
      setTvl(formatEther(t));
    } catch {
      setBalance("—");
      setTvl("—");
      setStatus("Unable to read the vault. Check the contract address and network.");
    }
  };

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider?.on) return;
    const handleAccountsChanged = (accounts: string[]) => {
      const next = accounts[0] as Address | undefined;
      setAccount(next);
      setBalance("—");
      setStatus(next ? "Wallet account changed. Refreshing vault balance." : "Wallet disconnected.");
      if (next) void refresh(next);
    };
    const handleChainChanged = (chainId: string) => {
      setBalance("—");
      setTvl("—");
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setStatus("Wrong network. Switch MetaMask to Sepolia before using the vault.");
      } else {
        setStatus("Sepolia selected. Refreshing vault data.");
        void refresh();
      }
    };
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [account]);

  useEffect(()=>{ void refresh(); },[account]);

  const connect = async () => {
    if (!window.ethereum) { setStatus("Open this site in the MetaMask mobile browser to connect."); return; }
    try {
      let chain = await window.ethereum.request({method:"eth_chainId"});
      if (chain !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:SEPOLIA_CHAIN_ID}]});
        chain = await window.ethereum.request({method:"eth_chainId"});
      }
      if (chain !== SEPOLIA_CHAIN_ID) throw new Error("MetaMask is not connected to Sepolia. Switch networks and try again.");
      const wallet = createWalletClient({chain:sepolia,transport:custom(window.ethereum as any)});
      const [who] = await wallet.requestAddresses();
      if (!who) throw new Error("No wallet account was authorized.");
      setAccount(who);
      setStatus("Wallet connected to Sepolia.");
      await refresh(who);
    } catch (e:any) { setStatus(e?.shortMessage || e?.cause?.shortMessage || e?.message || "Wallet connection failed."); }
  };

  const transact = async (kind:"deposit"|"withdraw") => {
    if (!account || !window.ethereum || !address) return;
    if (!Number.isFinite(Number(amount)) || Number(amount)<=0) { setStatus("Enter an amount greater than zero."); return; }
    setBusy(true);
    try {
      const [activeAccount, chain] = await Promise.all([
        window.ethereum.request({method:"eth_accounts"}),
        window.ethereum.request({method:"eth_chainId"})
      ]);
      if (chain !== SEPOLIA_CHAIN_ID) throw new Error("Switch MetaMask to Sepolia before submitting a transaction.");
      if (!activeAccount?.[0] || activeAccount[0].toLowerCase() !== account.toLowerCase()) {
        setAccount(activeAccount?.[0] as Address | undefined);
        throw new Error("The connected wallet account changed. Reconnect before submitting.");
      }
      const code = await publicClient.getBytecode({address});
      if (!code || code === "0x") throw new Error("No contract code found at the configured address on Sepolia. Check VITE_VAULT_ADDRESS.");
      const wallet=createWalletClient({account,chain:sepolia,transport:custom(window.ethereum as any)});
      const hash= kind==="deposit"
        ? await wallet.writeContract({address,abi,functionName:"deposit",value:parseEther(amount),gas:250_000n})
        : await wallet.writeContract({address,abi,functionName:"withdraw",args:[parseEther(amount)],gas:300_000n});
      setStatus("Transaction submitted: "+hash);
      const receipt = await publicClient.waitForTransactionReceipt({hash});
      if (receipt.status !== "success") throw new Error("The transaction was mined but reverted. Check the transaction on Sepolia Etherscan.");
      setStatus("Transaction confirmed.");
      await refresh(account);
    } catch(e:any) {
      const message = e?.shortMessage || e?.cause?.shortMessage || e?.details || e?.cause?.message || e?.message || "Transaction failed.";
      setStatus(String(message).slice(0,240));
    }
    finally { setBusy(false); }
  };

  return <main className="shell">
    <nav><div className="brand"><span className="mark">V</span> VAULT<span className="muted">/</span>SEPOLIA</div><button className="connect" onClick={connect}>{account ? account.slice(0,6)+"…"+account.slice(-4) : "Connect wallet"}</button></nav>
    <section className="hero"><div className="eyebrow">DECENTRALIZED FINANCE · TESTNET</div><h1>Your ETH.<br/><em>Your vault.</em></h1><p>A simple, transparent place to deposit and withdraw Sepolia ETH. Connect your wallet to get started.</p></section>
    <section className="stats"><article><small>YOUR VAULT BALANCE</small><strong>{balance==="—" ? balance : Number(balance).toFixed(5)} <i>ETH</i></strong></article><article><small>TOTAL VALUE LOCKED</small><strong>{tvl==="—" ? tvl : Number(tvl).toFixed(5)} <i>ETH</i></strong></article></section>
    <section className="panel"><div className="panelhead"><div><small>VAULT ACTIONS</small><h2>Manage your funds</h2></div><span className="network">● Sepolia</span></div>
      {!address && <div className="notice">Contract not deployed yet. Add <code>VITE_VAULT_ADDRESS</code> after the Sepolia deployment to enable transactions.</div>}
      <label htmlFor="amount">AMOUNT <span>ETH</span></label><input id="amount" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.01"/>
      <div className="actions"><button disabled={!address||!account||busy} onClick={()=>void transact("deposit")}>Deposit ETH ↗</button><button className="secondary" disabled={!address||!account||busy} onClick={()=>void transact("withdraw")}>Withdraw ETH ↗</button></div>
      <p className="status">{status}</p>
    </section>
    <footer><span>MINI DEFI VAULT</span><span>Educational project · Test ETH only</span></footer>
  </main>;
}
