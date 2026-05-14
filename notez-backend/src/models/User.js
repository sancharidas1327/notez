const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // null for OAuth users
    avatar: { type: String, default: "" },
    college: { type: String, default: "" },
    bio: { type: String, default: "" },

    // XP / Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    badges: [{ type: String }],

    // Auth
    provider: { type: String, enum: ["local", "google", "microsoft"], default: "local" },
    providerId: { type: String },

    // Role
    role: { type: String, enum: ["user", "creator", "admin"], default: "user" },

    // Plan
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    premiumExpiresAt: { type: Date },

    // Stats
    totalUploads: { type: Number, default: 0 },
    totalDownloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
