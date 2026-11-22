
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const Photo = require("../models/Photo");
const cloudinary = require("../config/cloudinary");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

const router = express.Router();

// GET: Admin dashboard statistics
router.get("/stats", adminAuthMiddleware, async (req, res) => {
  try {
    const publicPhotoFilter = {
      visibility: "public",
      publicConsent: true,
      isHidden: false,
    };

    const [
      pendingPhotos,
      approvedPhotos,
      rejectedPhotos,
      totalPublicPhotos,
    ] = await Promise.all([
      Photo.countDocuments({
        ...publicPhotoFilter,
        moderationStatus: "pending",
      }),
      Photo.countDocuments({
        ...publicPhotoFilter,
        moderationStatus: "approved",
      }),
      Photo.countDocuments({
        ...publicPhotoFilter,
        moderationStatus: "rejected",
      }),
      Photo.countDocuments(publicPhotoFilter),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        pendingPhotos,
        approvedPhotos,
        rejectedPhotos,
        totalPublicPhotos,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch dashboard statistics.",
    });
  }
});

// POST: Create the first administrator
router.post("/setup", async (req, res) => {
  try {
    const { name, email, password, setupSecret } = req.body;

    if (!name || !email || !password || !setupSecret) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (setupSecret !== process.env.ADMIN_SETUP_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin setup secret.",
      });
    }

    // Only allow initial setup when no admin exists
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin setup has already been completed.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "First administrator created successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (error) {
    console.error("Admin Setup Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create administrator.",
    });
  }
});


// POST: Administrator login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    return res.status(200).json({
      success: true,
      message: "Administrator login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not log in administrator.",
    });
  }
});


// GET: Fetch photos waiting for admin approval
router.get("/pending-photos", adminAuthMiddleware, async (req, res) => {
  try {
    const photos = await Photo.find({
      visibility: "public",
      publicConsent: true,
      moderationStatus: "pending",
      isHidden: false,
    })
      .populate("visitor", "visitorId")
      .populate("visit", "visitId")
      .select("-cloudinaryPublicId -cloudinaryAssetId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalPhotos: photos.length,
      photos,
    });

  } catch (error) {
    console.error("Pending Photos Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch pending photos.",
    });
  }
});

// GET: Fetch all public photos for admin management
router.get("/public-photos", adminAuthMiddleware, async (req, res) => {
  try {
    const photos = await Photo.find({
      visibility: "public",
      publicConsent: true,
    })
      .populate("visitor", "visitorId")
      .populate("visit", "visitId")
      .select("-cloudinaryPublicId -cloudinaryAssetId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalPhotos: photos.length,
      photos,
    });
  } catch (error) {
    console.error("Public Photos Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch public photos.",
    });
  }
});

// GET: Preview a pending public photo (admin only)
router.get("/:photoId/preview", adminAuthMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visibility: "public",
      publicConsent: true,
      isHidden: false,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Pending public photo not found.",
      });
    }

    const imageUrl = cloudinary.url(photo.cloudinaryPublicId, {
      resource_type: "image",
      type: "authenticated",
      format: photo.format,
      sign_url: true,
      secure: true,
    });

    return res.status(200).json({
      success: true,
      imageUrl,
    });

  } catch (error) {
    console.error("Admin Photo Preview Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load photo preview.",
    });
  }
});

// PATCH: Approve or reject a public photo
router.patch("/:photoId/moderation", adminAuthMiddleware, async (req, res) => {
  try {
    const { action } = req.body;

    if (!["approve", "reject", "revoke"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be approve, reject, or revoke.",
      });
    }

    const allowedStatuses =
  action === "revoke"
    ? ["approved"]
    : action === "approve"
    ? ["pending", "approval_revoked"]
    : ["pending", "approval_revoked"];

    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visibility: "public",
      publicConsent: true,
      moderationStatus: { $in: allowedStatuses },
      isHidden: false,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found or cannot perform this action.",
      });
    }

    if (action === "approve") {
      photo.moderationStatus = "approved";
    } else if (action === "reject") {
      photo.moderationStatus = "rejected";
    } else if (action === "revoke") {
      photo.moderationStatus = "approval_revoked";
    }

    await photo.save();

    return res.status(200).json({
      success: true,
      message: `Photo ${action === "revoke" ? "approval revoked" : action + "d"} successfully.`,
      photo: {
        photoId: photo._id,
        visibility: photo.visibility,
        moderationStatus: photo.moderationStatus,
      },
    });

  } catch (error) {
    console.error("Photo Moderation Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not moderate photo.",
    });
  }
});

module.exports = router;
