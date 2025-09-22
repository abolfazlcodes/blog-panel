import express from "express";
import { body } from "express-validator";

import { errorValidator } from "../middlewares/validator.js";
import {
  createBlogHandler,
  deleteBlogHandler,
  getAllBlogsHandler,
  updateBlogHandler,
} from "../controllers/blog.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/blogs", isAuthenticatedValidator, getAllBlogsHandler);

router.post(
  "/blogs",
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
  isAuthenticatedValidator,
  errorValidator,
  createBlogHandler
);

router.put(
  "/blogs/:id",
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
  isAuthenticatedValidator,
  errorValidator,
  updateBlogHandler
);

router.delete("/blogs/:id", isAuthenticatedValidator, deleteBlogHandler);

export { router };
