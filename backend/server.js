require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();

app.use(cors({
  origin: "*", // or "*" for all origins
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Routes

app.use("/api", analyzeRoutes);




// Start server
app.listen(3001, () => {
  console.log("Yayyayayyaayyy Server running on http://localhost:3001");
});
