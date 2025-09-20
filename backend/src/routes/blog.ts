import express from "express";
import { body } from "express-validator";

import { errorValidator } from "../middlewares/validator.js";
import { createBlogHandler, getAllBlogsHandler } from "../controllers/blog.js";

const router = express.Router();

router.get("/blog", getAllBlogsHandler);

router.post("/blog", [body("")], errorValidator, createBlogHandler);

export { router };
