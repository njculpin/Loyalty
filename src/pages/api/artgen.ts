const { createCanvas, loadImage } = require("canvas");
import path from "path";
import fs from "fs";

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const query = req.query;
    const { seed } = query;

    // const canvas = createCanvas(256, 512);
    // const ctx = canvas.getContext("2d");
    // ctx.imageSmoothingEnabled = true;
    // ctx.imageSmoothingQuality = "high";

    res.status(200).json({ message: `${seed}` });
  } catch (e) {
    res.status(400).json({ message: "error" });
  }
}
