import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const EarningsConsumer = await ethers.getContractFactory("EarningsConsumer");
  const earningsConsumer = await EarningsConsumer.deploy(
    "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
    "0x40193c8518bb267228fc409a613bdbd8ec5a97b3",
    "https://getpointbalance-dwado4aypa-uc.a.run.app/?tokenId=",
    "ca98366cc7314957b8c012c72f05aeeb"
  );
  await earningsConsumer.deployed();
  fs.writeFileSync(
    "./config.ts",
    `
  export const vendorCardAddress = "${earningsConsumer.address}"
  `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
