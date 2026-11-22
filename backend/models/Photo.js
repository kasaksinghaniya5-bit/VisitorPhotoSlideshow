
const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    // Photo owner
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },

    // Visit associated with this photo
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
    },

    // Cloudinary information
    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    cloudinaryAssetId: {
      type: String,
    },

    originalName: {
      type: String,
      required: true,
    },

    format: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    // Photo visibility
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },

    // Public sharing consent
    publicConsent: {
    type: Boolean,
    default: false,
    },

    publicConsentAt: {
    type: Date,
    default: null,
    },
    
    // Admin moderation
    moderationStatus: {
      type: String,
      enum: [
        "not_submitted",
        "pending",
        "approved",
        "rejected",
        "approval_revoked",
      ],
      default: "not_submitted",
    },

    // Temporarily exclude photo
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
