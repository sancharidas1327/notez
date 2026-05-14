const User = require("../models/User");
const Note = require("../models/Note");

// GET /api/users/:id/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -providerId");
    if (!user) return res.status(404).json({ message: "User not found" });

    const notes = await Note.find({ author: user._id, status: "active", isPublic: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title subject averageRating downloads likes createdAt");

    res.json({ user, notes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me  (auth)
const updateProfile = async (req, res) => {
  try {
    const { name, bio, college, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (college) updates.college = college;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select(
      "-password"
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me/bookmarks  (auth)
const getBookmarks = async (req, res) => {
  try {
    const notes = await Note.find({
      bookmarks: req.user._id,
      status: "active",
    }).populate("author", "name avatar");
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me/uploads  (auth)
const getMyUploads = async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, getBookmarks, getMyUploads };
