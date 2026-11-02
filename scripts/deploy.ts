import { ethers } from "hardhat";

async function main() {
  const Vault = await ethers.getContractFactory("MiniVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const address = await vault.getAddress();
  console.log("MiniVault deployed to:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});