import type { NextApiRequest, NextApiResponse } from "next";
const { ethers } = require("ethers");
const axios = require("axios");

type Data = {
  message: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const baseURL = process.env.ALCHEMY_TEST;
    const ownerAddr = req.body.wallet;
    const tokenAddr = req.body.tokenContractAddress;
    var data = JSON.stringify({
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [`${ownerAddr}`, [`${tokenAddr}`]],
    });
    var config = {
      method: "post",
      url: baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    const query = await axios(config);
    const balance = query.data.result.tokenBalances[0].tokenBalance;
    const result = ethers.utils.formatUnits(balance.toString(), "ether");
    res.status(200).json({ message: result });
  } catch (e) {
    res.status(400).json({ message: e });
  }
}
