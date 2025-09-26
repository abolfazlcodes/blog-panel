import express from "express";
import { body } from "express-validator";

import { errorValidator } from "../middlewares/validator.js";
import { isAuthenticatedValidator } from "../middlewares/isAuth.js";

import { getAllProjectsHandler } from "../controllers/projects.js";

const router = express.Router();

router.get("/projects", isAuthenticatedValidator, getAllProjectsHandler);

export { router };
