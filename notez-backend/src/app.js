require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { isGridFS, streamUploadedFile } = require("./utils/storage");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");
const xpRoutes = require("./routes/xpRoutes");

const app = express();

connectDB();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

if (isGridFS()) {
  app.get("/uploads/:filename", streamUploadedFile);
} else {
  app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));
}

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/xp", xpRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Notez backend is running",
    storage: process.env.STORAGE_DRIVER || "disk",
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "notez-backend" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
