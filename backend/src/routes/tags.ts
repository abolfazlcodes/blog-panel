import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import {
  createTagHandler,
  deleteTagHandler,
  getAllTagsHandler,
  getPublicTagsHandler,
  updateTagHandler,
} from "../controllers/tags.js";

const router = express.Router();

const tagLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const nameValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2 })
    .withMessage("name should be at least 2 characters"),
];

router.get("/tag", isAuthenticatedValidator, getAllTagsHandler);

router.post(
  "/tag",
  tagLimiter,
  isAuthenticatedValidator,
  nameValidator,
  errorValidator,
  createTagHandler
);

router.put(
  "/tag/:id",
  tagLimiter,
  isAuthenticatedValidator,
  nameValidator,
  errorValidator,
  updateTagHandler
);

router.delete("/tag/:id", tagLimiter, isAuthenticatedValidator, deleteTagHandler);

// public api routes:
router.get("/public/:username/tags", getPublicTagsHandler);

export { router };
