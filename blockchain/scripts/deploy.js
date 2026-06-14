const hre = require("hardhat");

async function main() {
  const CertRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const contract = await CertRegistry.deploy();
  await contract.waitForDeployment();
  console.log("CertificateRegistry deployed to:", await contract.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
