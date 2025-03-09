require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const taskRoutes = require("./routes/taskRoutes");
const focusRoutes = require("./routes/focusRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/focus", focusRoutes);

// Connect to MongoDB and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log("❌ DB Connection Error:", err));

