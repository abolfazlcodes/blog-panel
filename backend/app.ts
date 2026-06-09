import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";

import { router as authRouter } from "./src/routes/auth.js";
import { router as blogRouter } from "./src/routes/blog.js";
import { router as mediaFileRouter } from "./src/routes/media-file.js";
import { router as projectRouter } from "./src/routes/projects.js";
import { router as profileRouter } from "./src/routes/profile.js";
import { router as seriesRouter } from "./src/routes/series.js";
import { router as tagRouter } from "./src/routes/tags.js";
import { ICustomError } from "./src/types/index.js";
import prisma from "./src/prisma.js";

// make sure __dirname is defined for ES modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Support Docker/Swarm secrets: when VAR_FILE points to a file, load VAR from
// it (unless VAR is already set directly). Mirrors what the entrypoint does for
// the Prisma CLI, so running `node dist/app.js` standalone also works.
for (const key of ["JWT_SECRET_KEY", "DATABASE_URL"]) {
  const filePath = process.env[`${key}_FILE`];
  if (filePath && !process.env[key]) {
    try {
      process.env[key] = fs.readFileSync(filePath, "utf8").trim();
    } catch {
      console.error(`Failed to read ${key}_FILE at ${filePath}`);
    }
  }
}

const isProduction = process.env.NODE_ENV === "production";

// Fail fast on missing critical configuration rather than booting a broken server.
const REQUIRED_ENV = ["JWT_SECRET_KEY", "DATABASE_URL"] as const;
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`
  );
  process.exit(1);
}

const app = express();

// Behind a reverse proxy (nginx / Swarm ingress): trust the first hop so
// req.ip, req.protocol, and rate limiting see the real client address.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Security headers. Allow cross-origin loading of uploaded images so the
// public portfolio site can embed them.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Request logging — concise in dev, Apache-combined in production.
app.use(morgan(isProduction ? "combined" : "dev"));

// CORS allowlist from CORS_ORIGINS (comma-separated). When unset we reflect any
// origin, which is convenient in development; in production an unset allowlist
// is logged as a warning. Requests without an Origin header (curl, server-to-
// server calls, health checks) are always allowed.
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0 && isProduction) {
  console.warn(
    "[cors] CORS_ORIGINS is not set; reflecting all origins. Set it in production."
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true, // allow cookies or Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limit (configurable via env). The health probe is exempt.
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(globalLimiter);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "2mb" }));

app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Health / readiness probe — also verifies the database connection so
// orchestrators only route traffic once the DB is reachable.
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

app.use(authRouter);
app.use(blogRouter);
app.use(projectRouter);
app.use(mediaFileRouter);
app.use(profileRouter);
app.use(seriesRouter);
app.use(tagRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Notiq blog-panel API", status: "ok" });
});

// general error handler middleware;
app.use(
  (error: ICustomError, req: Request, res: Response, next: NextFunction) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;

    res.status(status).json({
      message,
      data: data,
    });
  }
);

const PORT = Number(process.env.PORT) || 8080;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown: stop accepting new connections, drain in-flight requests,
// then close the DB pool. Force-exit if something hangs past 10s.
const shutdown = (signal: string) => {
  console.log(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Could not close connections in time, forcing exit.");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
