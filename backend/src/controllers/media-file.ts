import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "../prisma.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export const uploadFileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userId = req?.userId;

    if (!req.file)
      return res
        .status(HTTP_STATUS_CODES.StatusBadRequest)
        .json({ error: "No file uploaded" });

    // hash to prevent duplicates
    const hash = crypto.createHash("md5").update(req.file.buffer).digest("hex");
    const ext = path.extname(req.file.originalname);
    const fileName = hash + ext;
    const filePath = path.join(uploadDir, fileName);

    // check if file exists already
    let existing = await prisma.blogImage.findUnique({ where: { hash } });

    if (existing) {
      if (existing.userId !== userId) {
        return res
          .status(HTTP_STATUS_CODES.StatusNotAllowed)
          .json({ error: "Forbidden: not your image" });
      }
      return res.json({ url: existing.url });
    }

    // save new file
    fs.writeFileSync(filePath, req.file.buffer);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    // store in DB
    const newImage = await prisma.blogImage.create({
      data: {
        url: fileUrl,
        hash,
        userId,
      },
    });

    return res.json({ id: newImage.id, url: newImage.url });
  } catch (err) {
    next(err);
  }
};
