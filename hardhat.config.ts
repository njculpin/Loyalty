require("dotenv").config();
import { ChainId } from "@biconomy/core-types";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    mumbai: {
      chainId: ChainId.POLYGON_MUMBAI,
      url: process.env.ALCHEMY_TEST,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: "0.8.18",
};

export default config;
