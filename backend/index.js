const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/files", require("./src/routes/fileRoutes"));
app.use("/api/jobs", require("./src/routes/jobRoutes"));
app.use("/api/blockchain", require("./src/routes/blockchainRoutes"));
app.use("/api/certificates", require("./src/routes/certificateRoutes"));
app.use("/api/chatbot", require("./src/routes/chatbotRoutes"));

app.get("/health", (req, res) =>
  res.json({ success: true, message: "OK", data: { status: "ok", timestamp: new Date().toISOString() } })
);

app.use((err, req, res, next) => {
  const message = err.message || "Internal server error";
  res.status(err.status || 500).json({ success: false, message, data: null });
});

const mongoUri =
  process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/certauth";

mongoose
  .connect(mongoUri)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      process.stdout.write(`Backend running on port ${port}\n`);
    });
    process.stdout.write("MongoDB connected\n");
  })
  .catch((err) => {
    process.stderr.write(`MongoDB connection error: ${err.message}\n`);
    process.exit(1);
  });
