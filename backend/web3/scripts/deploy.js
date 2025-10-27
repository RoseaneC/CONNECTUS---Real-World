const hre = require("hardhat");
async function main(){
  const VEXA = await hre.ethers.getContractFactory("VEXA");
  const vexa = await VEXA.deploy();
  await vexa.waitForDeployment();

  const Treasury = await hre.ethers.getContractFactory("VexaTreasury");
  const treasury = await Treasury.deploy(await vexa.getAddress());
  await treasury.waitForDeployment();

  console.log("VEXA:", await vexa.getAddress());
  console.log("Treasury:", await treasury.getAddress());
}
main().catch((e)=>{ console.error(e); process.exit(1); });

