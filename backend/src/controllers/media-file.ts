import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import prisma from "../prisma.js";
import HTTP_STATUS_CODES from "../utils/statusCodes.js";
import CustomError from "../utils/customError.js";

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

    if (!req.file) {
      const error = new CustomError("No file uploaded");
      error.statusCode = HTTP_STATUS_CODES.StatusBadRequest;
      throw error;
    }

    // hash to prevent duplicates
    const hash = crypto.createHash("md5").update(req.file.buffer).digest("hex");
    const ext = path.extname(req.file.originalname);
    const fileName = hash + ext;
    const filePath = path.join(uploadDir, fileName);

    // save new file
    fs.writeFileSync(filePath, req.file.buffer);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    return res.json({ url: fileUrl });
  } catch (err) {
    next(err);
  }
};
