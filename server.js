require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ---- Middleware ----
app.use(cors()); // Allow the React frontend (different port/origin) to call this API
app.use(express.json()); // Parse JSON request bodies

// ---- Routes ----
app.use("/api/users", userRoutes);

// Simple health-check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "User Management API is running" });
});

// ---- 404 handler (unknown routes) ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---- Global error handler (catches unexpected errors) ----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
