import express from "express";
import { body } from "express-validator";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import {
  createProjectHandler,
  deleteProjectHandler,
  getAllProjectsHandler,
  getSingleProjectHandler,
} from "../controllers/projects.js";

const router = express.Router();

router.get("/project", isAuthenticatedValidator, getAllProjectsHandler);

router.get("/project/:id", isAuthenticatedValidator, getSingleProjectHandler);

router.post(
  "/project",
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
  createProjectHandler
);

router.delete("/project/:id", isAuthenticatedValidator, deleteProjectHandler);

export { router };
