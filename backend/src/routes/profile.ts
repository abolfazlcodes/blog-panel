import express from "express";

import { isAuthenticatedValidator } from "../middlewares/isAuth.js";
import { getUserProfileData } from "../controllers/profile.js";

const router = express.Router();

router.get("/profile", isAuthenticatedValidator, getUserProfileData);

export { router };
