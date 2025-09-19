import express from "express";
import cors from "cors";

import { router as authRouter } from "./src/routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Successful",
    data: [{ id: 1, title: "first blog" }],
  });
});

app.listen(8080, () => {
  console.log("Backend running on http://localhost:8080");
});
