import { expect } from "chai";
import { ethers } from "hardhat";

describe("FullCycle", function () {
  let vendorCardContract: any;
  let patronCardContract: any;
  let loyaltyManagerContract: any;
  let loyaltyPointContract: any;

  // CREATE CONTRACTS
  it("Deploy Contracts", async function () {
    const VendorCard = await ethers.getContractFactory("LoyaltyCard");
    vendorCardContract = await VendorCard.deploy("Vendor Loyalty Card", "LYLV");

    const PatronCard = await ethers.getContractFactory("LoyaltyCard");
    patronCardContract = await PatronCard.deploy("Patron Loyalty Card", "LYLP");

    const LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
    loyaltyPointContract = await LoyaltyPoint.deploy("Loyalty Point", "LYLT");

    const LoyaltyManager = await ethers.getContractFactory("LoyaltyManager");
    loyaltyManagerContract = await LoyaltyManager.deploy(
      vendorCardContract.address,
      patronCardContract.address,
      loyaltyPointContract.address
    );
  });

  // MINT ACCOUNTS
  it("Mint Vendor and Patron Cards", async function () {
    const [vendor, patron] = await ethers.getSigners();
    await loyaltyManagerContract
      .connect(vendor)
      .mintVendorCard("https://www.v1.json");
    expect(await vendorCardContract.balanceOf(vendor.address)).to.equal(1);
    await loyaltyManagerContract
      .connect(patron)
      .mintPatronCard("https://www.p1.json");
    expect(await patronCardContract.balanceOf(patron.address)).to.equal(1);
  });

  // ISSUE A LOYALTY TOKEN FROM VENDOR TO PATRON
  it("Create Loyalty", async function () {
    const [vendor] = await ethers.getSigners();
    await loyaltyManagerContract.connect(vendor).createLoyalty(0, 0, 1);

    expect(await loyaltyManagerContract.getPatronBalance(0)).to.equal(1);
    expect(
      await loyaltyManagerContract.getPatronLoyaltyBalanceFromVendor(0, 0)
    ).to.equal(1);
  });

  // TRANSFER A LOYALTY TOKEN FROM PATRON TO VENDOR
  it("Redeem Loyalty", async function () {
    const [vendor] = await ethers.getSigners();
    await loyaltyManagerContract.connect(vendor).redeemLoyalty(0, 0, 1);

    expect(await loyaltyManagerContract.getVendorBalance(0)).to.equal(1);
    expect(await loyaltyManagerContract.getPatronBalance(0)).to.equal(0);
    expect(
      await loyaltyManagerContract.getPatronLoyaltyBalanceFromVendor(0, 0)
    ).to.equal(0);
  });

  it("Cash Out Loyalty", async function () {
    const [vendor] = await ethers.getSigners();
    await loyaltyManagerContract.connect(vendor).createLoyalty(0, 0, 1);
    await loyaltyManagerContract.connect(vendor).redeemLoyalty(0, 0, 1);
    const transactionResponse = await loyaltyManagerContract
      .connect(vendor)
      .cashOut(0, 1);
    const transactionReceipt = await transactionResponse.wait();
    console.log(transactionReceipt.events[0].args);
  });
});
