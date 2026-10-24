require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/db");

const app = express();
const { notFound, errorHandler } = require("./middleware/error.middleware");
const allowedOrigins = (process.env.FRONTEND_URL || "http://127.0.0.1:5500,http://localhost:5500")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.json({ message: "Neighbourhood Reuse & Donation Platform API is running." }));
app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ server: "running", database: "connected" });
  } catch (err) { next(err); }
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/items", require("./routes/items.routes"));
app.use("/api/requests", require("./routes/requests.routes"));
app.use("/api/users", require("./routes/users.routes"));

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => console.log(`API running at http://localhost:${port}`));
    console.log("MySQL connection successful.");
  } catch (err) {
    console.error("Could not connect to MySQL:", err.message);
    process.exit(1);
  }
}
start();
