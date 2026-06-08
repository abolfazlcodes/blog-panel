import express from "express";
import multer from "multer";

import { isAuthenticatedValidator } from "../middlewares/isAuth.js";
import { uploadFileHandler } from "../controllers/media-file.js";

const router = express.Router();

// Cap upload size (default 10MB, matches the editor's client-side limit).
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 10;

const storage = multer.memoryStorage(); // use memory to hash before saving
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

const uploadSingle = upload.single("image");

router.post(
  "/upload",
  isAuthenticatedValidator,
  // Run multer manually so its errors (oversized file, wrong type) become
  // clean 400s instead of a generic 500.
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        const tooLarge =
          err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
        return res.status(400).json({
          message: tooLarge
            ? `File is too large. Maximum size is ${MAX_UPLOAD_MB}MB.`
            : err.message,
        });
      }
      next();
    });
  },
  uploadFileHandler
);

export { router };
