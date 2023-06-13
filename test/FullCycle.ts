import { expect } from "chai";
import { ethers } from "hardhat";

describe("FullCycle", function () {
  let earningsConsumer: any;

  // CREATE CONTRACTS
  it("Deploy Contracts", async function () {
    const EarningsConsumer = await ethers.getContractFactory(
      "EarningsConsumer"
    );
    earningsConsumer = await EarningsConsumer.deploy(
      "0x326c977e6efc84e512bb9c30f76e30c160ed06fb", // link address
      "0x40193c8518bb267228fc409a613bdbd8ec5a97b3", // oracle address
      "ca98366cc7314957b8c012c72f05aeeb", // job
      "https://getpointbalance-dwado4aypa-uc.a.run.app/?Id=" // api url
    );
  });
});
