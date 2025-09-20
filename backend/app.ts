import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router as authRouter } from "./src/routes/auth.js";
import { router as blogRouter } from "./src/routes/blog.js";
import { ICustomError } from "./src/types/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(blogRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Successful",
    data: [{ id: 1, title: "first blog" }],
  });
});

// general error handler middleware;
app.use(
  (error: ICustomError, req: Request, res: Response, next: NextFunction) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({
      message,
      error: error,
      data: data,
    });
  }
);

app.listen(8080, () => {
  console.log("Backend running on http://localhost:8080");
});
