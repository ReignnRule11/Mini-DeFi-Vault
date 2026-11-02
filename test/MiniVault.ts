import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MiniVault", function () {
  async function deployVault() {
    const [owner, other] = await ethers.getSigners();
    const Vault = await ethers.getContractFactory("MiniVault");
    const vault = await Vault.deploy();
    return { vault, owner, other };
  }

  it("records deposits and emits an event", async function () {
    const { vault, owner } = await loadFixture(deployVault);
    await expect(vault.deposit({ value: ethers.parseEther("1") }))
      .to.emit(vault, "Deposited").withArgs(owner.address, ethers.parseEther("1"));
    expect(await vault.getBalance(owner.address)).to.equal(ethers.parseEther("1"));
    expect(await vault.totalDeposits()).to.equal(ethers.parseEther("1"));
  });

  it("prevents withdrawing more than the caller deposited", async function () {
    const { vault, other } = await loadFixture(deployVault);
    await expect(vault.connect(other).withdraw(1)).to.be.revertedWith("Insufficient vault balance");
  });

  it("isolates user balances and supports withdrawals", async function () {
    const { vault, owner, other } = await loadFixture(deployVault);
    await vault.deposit({ value: ethers.parseEther("2") });
    await vault.connect(other).deposit({ value: ethers.parseEther("1") });
    await vault.withdraw(ethers.parseEther("0.5"));
    expect(await vault.getBalance(owner.address)).to.equal(ethers.parseEther("1.5"));
    expect(await vault.getBalance(other.address)).to.equal(ethers.parseEther("1"));
    expect(await vault.totalDeposits()).to.equal(ethers.parseEther("2.5"));
  });

  it("rejects zero-value deposits", async function () {
    const { vault } = await loadFixture(deployVault);
    await expect(vault.deposit()).to.be.revertedWith("Deposit must be greater than zero");
  });
});