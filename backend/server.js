
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const visitorRoutes = require("./routes/visitorRoutes");
const photoRoutes = require("./routes/photoRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/visitors", visitorRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/admin", adminRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Visitor Photo Slideshow Backend is Running!");
});

// Test API route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Frontend can communicate with backend!",
  });
});

// Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error.message);
  });
