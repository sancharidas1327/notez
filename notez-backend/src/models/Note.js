const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subject: { type: String, required: true },
    tags: [{ type: String }],
    college: { type: String, default: "" },

    // File
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "image", "text"], required: true },
    fileSize: { type: Number }, // in bytes

    // Author
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Visibility
    isPublic: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false }, // creator can sell

    // Engagement
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Ratings
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: { type: Number, default: 0 },

    // Comments
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Status
    status: { type: String, enum: ["active", "flagged", "removed"], default: "active" },
  },
  { timestamps: true }
);

// Full-text search index
noteSchema.index({ title: "text", subject: "text", tags: "text" });

module.exports = mongoose.model("Note", noteSchema);
