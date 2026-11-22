
const jwt = require("jsonwebtoken");
const Visitor = require("../models/Visitor");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find visitor in database
    const visitor = await Visitor.findOne({
      visitorId: decoded.visitorId,
    }).select("-pinHash");

    if (!visitor) {
      return res.status(401).json({
        success: false,
        message: "Visitor account not found.",
      });
    }

    // Attach visitor details to request
    req.visitor = visitor;

    // Continue to next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = authMiddleware;
