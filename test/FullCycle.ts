import { expect } from "chai";
import { ethers } from "hardhat";

describe("FullCycle", function () {
  const recordId = "123";
  let earningsConsumer: any;
  let loyaltyCoin: any;
  let loyaltyNft: any;
  let loyaltyMarket: any;

  // CREATE CONTRACTS
  it("Deploy Contracts", async function () {
    const EarningsConsumer = await ethers.getContractFactory(
      "EarningsConsumer"
    );
    earningsConsumer = await EarningsConsumer.deploy(
      "0x326c977e6efc84e512bb9c30f76e30c160ed06fb", // link address
      "0x40193c8518bb267228fc409a613bdbd8ec5a97b3", // oracle address
      "ca98366cc7314957b8c012c72f05aeeb", // job
      "https://getpointbalance-dwado4aypa-uc.a.run.app/?id=" // api url
    );

    const LoyaltyCoin = await ethers.getContractFactory("LoyaltyCoin");
    loyaltyCoin = await LoyaltyCoin.deploy(100);

    const LoyaltyNFT = await ethers.getContractFactory("LoyaltyNFT");
    loyaltyNft = await LoyaltyNFT.deploy();

    const LoyaltyMarket = await ethers.getContractFactory("LoyaltyMarket");
    loyaltyMarket = await LoyaltyMarket.deploy();
  });

  it("Set Token Address", async function () {
    await earningsConsumer.setLoyaltyCoinAddress(loyaltyCoin.address);
    await earningsConsumer.setLoyaltyNftAddress(loyaltyNft.address);
    await loyaltyCoin.setEarningsConsumer(earningsConsumer.address);
    await loyaltyNft.setEarningsConsumer(earningsConsumer.address);
  });

  it("Confirm Oracle", async function () {
    await loyaltyCoin.verifyEarnings(recordId);
    await loyaltyNft.verifyEarnings(recordId);
  });

  it("Mint Coin", async function () {});

  it("Mint NFT", async function () {});

  it("Trigger Oracle", async function () {});

  it("Confirm Oracle", async function () {});
});
