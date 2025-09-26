import express from "express";
import { body } from "express-validator";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import {
  createProjectHandler,
  deleteProjectHandler,
  getAllProjectsHandler,
  getPublishedProjectHandler,
  getPublishedSingleProjectHandler,
  getSingleProjectHandler,
  publishProjectHandler,
  updateProjectHandler,
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

router.put(
  "/project/:id",
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
  updateProjectHandler
);

router.patch("/blog/:id", isAuthenticatedValidator, publishProjectHandler);
router.delete("/project/:id", isAuthenticatedValidator, deleteProjectHandler);

// public api routes:
router.get("/public/:username/project", getPublishedProjectHandler);
router.get("/public/:username/project/:id", getPublishedSingleProjectHandler);

export { router };
