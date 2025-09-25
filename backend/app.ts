import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { router as authRouter } from "./src/routes/auth.js";
import { router as blogRouter } from "./src/routes/blog.js";
import { router as mediaFileRouter } from "./src/routes/media-file.js";
import { ICustomError } from "./src/types/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      callback(null, origin); // allow the requesting origin
    },
    credentials: true, // allow cookies or Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use(authRouter);
app.use(blogRouter);
app.use(mediaFileRouter);

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
