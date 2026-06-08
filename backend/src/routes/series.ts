import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import {
  createSeriesHandler,
  deleteSeriesHandler,
  getAllSeriesHandler,
  getPublicSeriesHandler,
  getSingleSeriesHandler,
  updateSeriesHandler,
} from "../controllers/series.js";

const router = express.Router();

const seriesLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const titleValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .isLength({ min: 3 })
    .withMessage("title should be at least 3 characters"),
];

router.get("/series", isAuthenticatedValidator, getAllSeriesHandler);
router.get("/series/:id", isAuthenticatedValidator, getSingleSeriesHandler);

router.post(
  "/series",
  seriesLimiter,
  isAuthenticatedValidator,
  titleValidator,
  errorValidator,
  createSeriesHandler
);

router.put(
  "/series/:id",
  seriesLimiter,
  isAuthenticatedValidator,
  titleValidator,
  errorValidator,
  updateSeriesHandler
);

router.delete(
  "/series/:id",
  seriesLimiter,
  isAuthenticatedValidator,
  deleteSeriesHandler
);

// public api routes:
router.get("/public/:username/series/:slug", getPublicSeriesHandler);

export { router };
