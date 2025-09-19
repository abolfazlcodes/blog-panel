import express from "express";
import { body } from "express-validator";

import { loginHandler } from "../controllers/auth.js";
import { errorValidator } from "../middlewares/validator.js";

const router = express.Router();

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a correct password format.")
      .isLength({
        min: 6,
        max: 255,
      })
      .withMessage("password must be at least 6 characters."),
  ],
  errorValidator,
  loginHandler
);

export { router };
