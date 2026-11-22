
const express = require("express");
const crypto = require("crypto");

const Visitor = require("../models/Visitor");
const Visit = require("../models/Visit");
const Photo = require("../models/Photo");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Generate a unique Visit ID
const generateVisitId = () => {
  return "VISIT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Check actual image file signature
const isValidImage = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    return "png";
  }

  return null;
};

// Upload a single image to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "visitor-slideshow",
        resource_type: "image",
        type: "authenticated",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(file.buffer);
  });
};


// Generate a signed delivery URL for an authenticated image
const getSignedImageUrl = (photo) => {
  return cloudinary.url(photo.cloudinaryPublicId, {
    resource_type: "image",
    type: "authenticated",
    format: photo.format,
    sign_url: true,
    secure: true,
  });
};


// POST: Upload visitor photos
router.post(
  "/upload",
  authMiddleware,
  upload.array("photos", 7),
  async (req, res) => {
    let visit = null;
    const uploadedAssets = [];

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one photo.",
        });
      }

      // Validate actual file signatures
      for (const file of req.files) {
        const detectedFormat = isValidImage(file.buffer);

        if (!detectedFormat) {
          return res.status(400).json({
            success: false,
            message: "An uploaded file is not a valid JPG or PNG image.",
          });
        }

        file.detectedFormat = detectedFormat;
      }

      // Create a new visit for this upload session
      visit = await Visit.create({
        visitId: generateVisitId(),
        visitor: req.visitor._id,
      });

      const results = [];

      // Upload each photo separately
      for (const file of req.files) {
        let cloudResult;

        try {
  console.log("1. Starting Cloudinary upload:", file.originalname);

  cloudResult = await uploadToCloudinary(file);

  console.log("2. Cloudinary upload successful:", cloudResult.public_id);
          uploadedAssets.push(cloudResult.public_id);
  console.log("3. Saving photo metadata to MongoDB");
          const photo = await Photo.create({
            visitor: req.visitor._id,
            visit: visit._id,
            cloudinaryPublicId: cloudResult.public_id,
            cloudinaryAssetId: cloudResult.asset_id,
            originalName: file.originalname,
            format: file.detectedFormat,
            fileSize: file.size,
          });

          results.push({
            success: true,
            photoId: photo._id,
            originalName: file.originalname,
          });
        } catch (error) {
          console.error("Individual Photo Upload Error:", error);
          console.error("Photo Upload Error:", error.message);

          results.push({
            success: false,
            originalName: file.originalname,
            message: "This photo could not be uploaded.",
          });
        }
      }

      const successfulUploads = results.filter(
        (item) => item.success
      ).length;

      // Remove visit if every photo failed
      if (successfulUploads === 0) {
        await Visit.findByIdAndDelete(visit._id);

        return res.status(500).json({
          success: false,
          message: "No photos could be uploaded.",
          results,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Photo upload session completed.",
        visitId: visit.visitId,
        totalUploaded: successfulUploads,
        totalFailed: results.length - successfulUploads,
        results,
      });
    } catch (error) {
      console.error("Upload Error:", error.message);

      // Clean up uploaded Cloudinary files if session setup fails
      if (visit) {
        await Photo.deleteMany({ visit: visit._id });
        await Visit.findByIdAndDelete(visit._id);
      }

      for (const publicId of uploadedAssets) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            type: "authenticated",
          });
        } catch (cleanupError) {
          console.error("Cloudinary cleanup failed:", cleanupError.message);
        }
      }

      return res.status(500).json({
        success: false,
        message: "Photo upload failed. Please try again.",
      });
    }
  }
);

// PATCH: Change photo visibility
router.patch("/:photoId/visibility", authMiddleware, async (req, res) => {
  try {
    const { visibility, consent } = req.body;

    // Only these two visibility values are allowed
    if (!["private", "public"].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be either private or public.",
      });
    }

    // Find photo and make sure it belongs to the logged-in visitor
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visitor: req.visitor._id,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found.",
      });
    }

// Public sharing requires explicit consent

    // Public sharing requires explicit consent
    if (visibility === "public") {
      if (consent !== true) {
        return res.status(400).json({
          success: false,
          message: "You must provide consent before making a photo public.",
        });
      }

      photo.visibility = "public";
      photo.publicConsent = true;
      photo.publicConsentAt = new Date();
      photo.moderationStatus = "pending";

    } else {
      photo.visibility = "private";
      photo.publicConsent = false;
      photo.publicConsentAt = null;
      photo.moderationStatus = "not_submitted";
    }


    await photo.save();

    return res.status(200).json({
      success: true,
      message: `Photo visibility changed to ${visibility}.`,
      photo: {
  photoId: photo._id,
  visibility: photo.visibility,
  moderationStatus: photo.moderationStatus,
  publicConsent: photo.publicConsent,
  publicConsentAt: photo.publicConsentAt,
},
    });
  } catch (error) {
    console.error("Visibility Update Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update photo visibility.",
    });
  }
});


 // PATCH: Hide or unhide a photo
router.patch("/:photoId/hide", authMiddleware, async (req, res) => {
  try {
    const { isHidden } = req.body;

    if (typeof isHidden !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isHidden must be true or false.",
      });
    }

    // Find only the logged-in visitor's photo
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visitor: req.visitor._id,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found.",
      });
    }

    photo.isHidden = isHidden;

    await photo.save();

    return res.status(200).json({
      success: true,
      message: isHidden
        ? "Photo hidden successfully."
        : "Photo unhidden successfully.",
      photo: {
        photoId: photo._id,
        isHidden: photo.isHidden,
      },
    });
  } catch (error) {
    console.error("Hide Photo Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update photo visibility.",
    });
  }
});


// GET: Retrieve photos belonging to the logged-in visitor
router.get("/my-photos", authMiddleware, async (req, res) => {
  try {
    const photos = await Photo.find({
      visitor: req.visitor._id,
    })
      .populate("visit", "visitId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalPhotos: photos.length,
      photos,
    });
  } catch (error) {
    console.error("Gallery Fetch Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve your photos.",
    });
  }
});

// GET: Securely deliver a visitor's own photo
router.get("/:photoId/image", authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visitor: req.visitor._id,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found or access denied.",
      });
    }

    const imageUrl = getSignedImageUrl(photo);

    return res.redirect(imageUrl);

  } catch (error) {
    console.error("Personal Image Delivery Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not deliver your photo.",
    });
  }
});


router.get("/:photoId/download", authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visitor: req.visitor._id,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found or access denied.",
      });
    }

    const imageUrl = getSignedImageUrl(photo);

    return res.redirect(imageUrl);

  } catch (error) {
    console.error("Photo Download Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not download your photo.",
    });
  }
});

// GET: Retrieve approved photos for the shared slideshow
router.get("/shared", async (req, res) => {
  try {
    const photos = await Photo.find({
      visibility: "public",
      moderationStatus: "approved",
      publicConsent: true,
      isHidden: false,
    })
      .select("originalName format createdAt visit")
      .populate("visit", "visitId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalPhotos: photos.length,
      photos: photos.map((photo) => ({
        photoId: photo._id,
        originalName: photo.originalName,
        format: photo.format,
        createdAt: photo.createdAt,
        visitId: photo.visit?.visitId,
        imageUrl: `/api/photos/shared/${photo._id}/image`,
      })),
    });
  } catch (error) {
    console.error("Shared Slideshow Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve shared photos.",
    });
  }
});


// GET: Securely deliver an approved public image
router.get("/shared/:photoId/image", async (req, res) => {
  try {
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visibility: "public",
      publicConsent: true,
      moderationStatus: "approved",
      isHidden: false,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Approved public photo not found.",
      });
    }

    const imageUrl = getSignedImageUrl(photo);

    return res.redirect(imageUrl);

  } catch (error) {
    console.error("Shared Image Delivery Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not deliver image.",
    });
  }
});

 // DELETE: Permanently delete a visitor's photo
router.delete("/:photoId", authMiddleware, async (req, res) => {
  try {
    // Find photo belonging to the logged-in visitor
    const photo = await Photo.findOne({
      _id: req.params.photoId,
      visitor: req.visitor._id,
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found.",
      });
    }

    // Delete image from Cloudinary first
    const cloudResult = await cloudinary.uploader.destroy(
      photo.cloudinaryPublicId,
      {
        resource_type: "image",
        type: "authenticated",
      }
    );

    // Do not delete the database record if Cloudinary deletion failed
    if (cloudResult.result !== "ok" &&
        cloudResult.result !== "not found") {
      return res.status(500).json({
        success: false,
        message: "Could not delete photo from cloud storage.",
      });
    }

    // Delete photo record from MongoDB
    await Photo.findByIdAndDelete(photo._id);

    return res.status(200).json({
      success: true,
      message: "Photo permanently deleted.",
    });

  } catch (error) {
    console.error("Delete Photo Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not delete photo.",
    });
  }
});


// Handle Multer errors
router.use((error, req, res, next) => {
  if (error instanceof require("multer").MulterError) {
    return res.status(400).json({
      success: false,
      message: error.code === "LIMIT_FILE_SIZE"
        ? "Each photo must be 20 MB or smaller."
        : "Maximum 7 photos are allowed per upload.",
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});



module.exports = router;
