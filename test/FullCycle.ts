import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FullCycle", function () {
  let vendorCardContract: any;
  let patronCardContract: any;
  let loyaltyManagerContract: any;
  let loyaltyPointContract: any;
  let vendorAccount: any;
  let patronAccount: any;

  // CREATE CONTRACTS
  it("We should deploy Vendor, Patron, Manager, and Token", async function () {
    const VendorCard = await ethers.getContractFactory("LoyaltyCard");
    vendorCardContract = await VendorCard.deploy("Vendor Loyalty Card", "LYLV");

    const PatronCard = await ethers.getContractFactory("LoyaltyCard");
    patronCardContract = await PatronCard.deploy("Patron Loyalty Card", "LYLP");

    const LoyaltyPoint = await ethers.getContractFactory("LoyaltyPoint");
    loyaltyPointContract = await PatronCard.deploy("Loyalty Point", "LYLT");

    const LoyaltyManager = await ethers.getContractFactory("LoyaltyManager");
    loyaltyManagerContract = await LoyaltyManager.deploy(
      vendorCardContract.address,
      patronCardContract.address,
      loyaltyPointContract.address
    );
  });

  // MINT ACCOUNTS
  it("Mint Vendor and Patron Cards", async function () {
    const [account1, account2] = await ethers.getSigners();
    vendorAccount = account1;
    await vendorCardContract
      .connect(account1)
      .mint(account1.address, "tokenURI");
    expect(await vendorCardContract.balanceOf(account1.address)).to.equal(1);

    patronAccount = account2;
    await patronCardContract
      .connect(account2)
      .mint(account2.address, "tokenURI");
    expect(await patronCardContract.balanceOf(account2.address)).to.equal(1);
  });

  // ISSUE A LOYALTY TOKEN FROM VENDOR TO PATRON
  it("Create Loyalty", async function () {
    const [account1, account2] = await ethers.getSigners();
    await loyaltyManagerContract.connect(account2).createLoyalty(1, 1, 1);
    expect(await loyaltyManagerContract.getPatronBalance(1)).to.equal(1);
    expect(
      await loyaltyManagerContract.getPatronLoyaltyBalanceFromVendor(1, 1)
    ).to.equal(1);
  });

  // TRANSFER A LOYALTY TOKEN FROM PATRON TO VENDOR
  it("Redeem Loyalty", async function () {
    const [account1, account2] = await ethers.getSigners();
    await loyaltyManagerContract.connect(account1).redeemLoyalty(1, 1, 1);
    expect(await loyaltyManagerContract.getVendorBalance(1)).to.equal(1);
    expect(await loyaltyManagerContract.getPatronBalance(1)).to.equal(0);
    expect(
      await loyaltyManagerContract.getPatronLoyaltyBalanceFromVendor(1, 1)
    ).to.equal(0);
  });
});
