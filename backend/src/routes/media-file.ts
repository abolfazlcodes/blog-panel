import express from "express";
import multer from "multer";

import { isAuthenticatedValidator } from "../middlewares/isAuth.js";
import { uploadFileHandler } from "../controllers/media-file.js";

const router = express.Router();

const storage = multer.memoryStorage(); // use memory to hash before saving
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  isAuthenticatedValidator,
  upload.single("image"),
  uploadFileHandler
);

export { router };
