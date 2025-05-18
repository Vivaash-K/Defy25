const hre = require("hardhat");

async function main() {
  const PostContract = await hre.ethers.getContractFactory("PostContract");
  const postContract = await PostContract.deploy();

  await postContract.deployed();
  console.log("PostContract deployed to:", postContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
``