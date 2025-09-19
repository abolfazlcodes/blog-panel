import express from "express";
import { body } from "express-validator";

import { createUserHandler, loginHandler } from "../controllers/auth.js";
import { errorValidator } from "../middlewares/validator.js";

const router = express.Router();

router.post(
  "/sign-up",
  [
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({
        min: 3,
      })
      .withMessage("First name should be at least 3 characters"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({
        min: 3,
      })
      .withMessage("Last name should be at least 3 characters"),
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({
        min: 8,
        max: 255,
      })
      .withMessage("password must be at least 6 characters.")
      .matches(/[A-Z]/)
      .withMessage("password must contain at least one capital letter.")
      .matches(/\d/)
      .withMessage("password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],
  errorValidator,
  createUserHandler
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({
        min: 8,
        max: 255,
      })
      .withMessage("password must be at least 8 characters."),
  ],
  errorValidator,
  loginHandler
);

export { router };
