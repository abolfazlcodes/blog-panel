const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Successful",
    data: [{ id: 1, title: "first blog" }],
  });
});

app.listen(8080, () => {
  console.log("Backend running on http://localhost:8080");
});
