import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import {
  createBlogHandler,
  deleteBlogHandler,
  getAllBlogsHandler,
  getPublishedBlogsHandler,
  getPublishedSingleBlogHandler,
  getSingleBlogHandler,
  publishBlogHandler,
  updateBlogHandler,
  updateLikesCountHandler,
} from "../controllers/blog.js";

const router = express.Router();

const blogLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 login attempts
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

router.get("/blog", isAuthenticatedValidator, getAllBlogsHandler);
router.get("/blog/:id", isAuthenticatedValidator, getSingleBlogHandler);

router.post(
  "/blog",
  blogLimiter,
  isAuthenticatedValidator,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("title is required")
      .isLength({
        min: 5,
      })
      .withMessage("title should be at least 5 characters"),
    body("short_description")
      .trim()
      .notEmpty()
      .withMessage("short description is required")
      .isLength({
        min: 5,
      })
      .withMessage("short description should be at least 5 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("description is required")
      .isLength({
        min: 10,
      })
      .withMessage("description should be at least 10 characters"),
  ],
  errorValidator,
  createBlogHandler
);

router.put(
  "/blog/:id",
  blogLimiter,
  isAuthenticatedValidator,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("title is required")
      .isLength({
        min: 5,
      })
      .withMessage("title should be at least 5 characters"),
    body("short_description")
      .trim()
      .notEmpty()
      .withMessage("short description is required")
      .isLength({
        min: 5,
      })
      .withMessage("short description should be at least 5 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("description is required")
      .isLength({
        min: 10,
      })
      .withMessage("description should be at least 10 characters"),
  ],

  errorValidator,
  updateBlogHandler
);

router.patch("/blog/:id", isAuthenticatedValidator, publishBlogHandler);
router.delete(
  "/blog/:id",
  blogLimiter,
  isAuthenticatedValidator,
  deleteBlogHandler
);

// public api routes:
router.get("/public/:username/blog", getPublishedBlogsHandler);
router.get("/public/:username/blog/:id", getPublishedSingleBlogHandler);
router.patch("/public/:username/blog/:id", updateLikesCountHandler);

export { router };
