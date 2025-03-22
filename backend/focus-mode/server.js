const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB using 127.0.0.1 to avoid connection issues
mongoose.connect("mongodb://127.0.0.1:27017/electron_focus", {})
  .then(() => console.log("✅ Connected to M1ongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
const taskRoutes = require("./routes/taskRoutes");
const sessionRoutes = require("./routes/SessionRoutes");

app.use("/api/tasks", taskRoutes);
app.use("/api/sessions", sessionRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));