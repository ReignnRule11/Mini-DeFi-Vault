import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, formatEther, http, parseEther, type Address } from "viem";
import { sepolia } from "viem/chains";

const address = import.meta.env.VITE_VAULT_ADDRESS as Address | undefined;
const abi = [
  { type:"function", name:"deposit", stateMutability:"payable", inputs:[], outputs:[] },
  { type:"function", name:"withdraw", stateMutability:"nonpayable", inputs:[{name:"amount",type:"uint256"}], outputs:[] },
  { type:"function", name:"getBalance", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{type:"uint256"}] },
  { type:"function", name:"totalDeposits", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] }
] as const;
const publicClient = createPublicClient({ chain:sepolia, transport:http() });

declare global { interface Window { ethereum?: any } }

export default function App() {
  const [account,setAccount] = useState<Address>();
  const [amount,setAmount] = useState("0.01");
  const [balance,setBalance] = useState("—");
  const [tvl,setTvl] = useState("—");
  const [status,setStatus] = useState("Connect your wallet to begin.");
  const [busy,setBusy] = useState(false);
  const refresh = async (who=account) => {
    if (!address || !who) return;
    try {
      const [b,t] = await Promise.all([
        publicClient.readContract({address,abi,functionName:"getBalance",args:[who]}),
        publicClient.readContract({address,abi,functionName:"totalDeposits"})
      ]);
      setBalance(formatEther(b)); setTvl(formatEther(t));
    } catch { setStatus("Unable to read the vault. Check the contract address and network."); }
  };
  useEffect(()=>{ void refresh(); },[account]);
  const connect = async () => {
    if (!window.ethereum) { setStatus("Install or open MetaMask to connect."); return; }
    try {
      const wallet = createWalletClient({chain:sepolia,transport:custom(window.ethereum)});
      const [who] = await wallet.requestAddresses();
      const chain = await window.ethereum.request({method:"eth_chainId"});
      if (chain !== "0xaa36a7") { await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xaa36a7"}]}); }
      setAccount(who); setStatus("Wallet connected to Sepolia."); await refresh(who);
    } catch (e:any) { setStatus(e?.shortMessage || e?.message || "Wallet connection failed."); }
  };
  const transact = async (kind:"deposit"|"withdraw") => {
    if (!account || !window.ethereum || !address) return;
    if (!Number.isFinite(Number(amount)) || Number(amount)<=0) { setStatus("Enter an amount greater than zero."); return; }
    setBusy(true);
    try {
      const wallet=createWalletClient({account,chain:sepolia,transport:custom(window.ethereum)});
      const hash= kind==="deposit"
        ? await wallet.writeContract({address,abi,functionName:"deposit",value:parseEther(amount)})
        : await wallet.writeContract({address,abi,functionName:"withdraw",args:[parseEther(amount)]});
      setStatus("Transaction submitted: "+hash);
      await publicClient.waitForTransactionReceipt({hash});
      setStatus("Transaction confirmed."); await refresh();
    } catch(e:any) { setStatus(e?.shortMessage || e?.message || "Transaction failed."); }
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