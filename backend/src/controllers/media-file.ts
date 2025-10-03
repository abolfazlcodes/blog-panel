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

    // generate hash
    const hash = crypto.createHash("md5").update(req.file.buffer).digest("hex");
    const ext = path.extname(req.file.originalname);
    const fileName = hash + ext;
    const filePath = path.join(uploadDir, fileName);

    // avoid duplicate writes if file already exists
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    // Save to DB (MediaFile)
    const mediaFile = await prisma.mediaFile.upsert({
      where: { hash }, // ensure uniqueness by hash
      update: {}, // if exists, do nothing
      create: {
        url: fileUrl,
        filename: req.file.originalname,
        mime_type: req.file.mimetype,
        size: req.file.size,
        hash,
        userId: userId || null, // optional
      },
    });

    return res.json(mediaFile);
  } catch (err) {
    next(err);
  }
};
