import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const VendorCard = await ethers.getContractFactory("LoyaltyCard");
  const vendorCardContract = await VendorCard.deploy(
    "Vendor Loyalty Card",
    "LYLV"
  );
  await vendorCardContract.deployed();

  const PatronCard = await ethers.getContractFactory("LoyaltyCard");
  const patronCardContract = await PatronCard.deploy(
    "Patron Loyalty Card",
    "LYLP"
  );
  await patronCardContract.deployed();

  const LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
  const loyaltyPointContract = await LoyaltyPoint.deploy(
    "Loyalty Point",
    "LYLT"
  );
  await loyaltyPointContract.deployed();

  const LoyaltyManager = await ethers.getContractFactory("LoyaltyManager");
  const loyaltyManagerContract = await LoyaltyManager.deploy(
    vendorCardContract.address,
    patronCardContract.address,
    loyaltyPointContract.address
  );
  await loyaltyManagerContract.deployed();

  await loyaltyPointContract.setLoyaltyManagerAddress(
    loyaltyManagerContract.address
  );
  await loyaltyPointContract.deployed();

  fs.writeFileSync(
    "./config.ts",
    `
  export const vendorCardAddress = "${vendorCardContract.address}"
  export const patronCardAddress = "${patronCardContract.address}"
  export const loyaltyPointAddress = "${loyaltyPointContract.address}"
  export const loyaltyManagerAddress = "${loyaltyManagerContract.address}"
  
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
