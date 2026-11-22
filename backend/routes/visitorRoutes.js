const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Visitor = require("../models/Visitor");

const router = express.Router();

// Generate a unique Visitor ID
const generateVisitorId = () => {
  return "VIS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// POST: Register a new visitor
router.post("/register", async (req, res) => {
  try {
    const { name, email, pin } = req.body;

    // Check required fields
    if (!name || !email || !pin) {
      return res.status(400).json({
        success: false,
        message: "Name, email and PIN are required.",
      });
    }

    // Validate basic input formats
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof pin !== "string" ||
      !/^\d+$/.test(pin)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name and email.",
      });
    }

    // Check whether email already exists
    const existingVisitor = await Visitor.findOne({
      email: cleanEmail,
    });

    if (existingVisitor) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Hash the PIN before saving
    const pinHash = await bcrypt.hash(pin, 12);

    // Generate Visitor ID
    const visitorId = generateVisitorId();

    // Create visitor record
    const newVisitor = await Visitor.create({
      visitorId,
      name: cleanName,
      email: cleanEmail,
      pinHash,
    });

    // Send successful response
    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully!",
      visitor: {
        visitorId: newVisitor.visitorId,
        name: newVisitor.name,
        email: newVisitor.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email or Visitor ID is already in use. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});


// POST: Visitor Login
router.post("/login", async (req, res) => {
  try {
    const { visitorId, pin } = req.body;

    // Validate input
    if (
      typeof visitorId !== "string" ||
      typeof pin !== "string" ||
      !visitorId.trim() ||
      !/^\d+$/.test(pin)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Visitor ID and PIN.",
      });
    }

    // Find visitor using Visitor ID
    const visitor = await Visitor.findOne({
      visitorId: visitorId.trim().toUpperCase(),
    });

    if (!visitor) {
      return res.status(401).json({
        success: false,
        message: "Invalid Visitor ID or PIN.",
      });
    }

    // Compare entered PIN with stored hash
    const isMatch = await bcrypt.compare(pin, visitor.pinHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Visitor ID or PIN.",
      });
    }

    // Generate authentication token
    const token = jwt.sign(
      { visitorId: visitor.visitorId },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      visitor: {
        visitorId: visitor.visitorId,
        name: visitor.name,
        email: visitor.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});


module.exports = router;
