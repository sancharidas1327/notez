const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getBookmarks, getMyUploads } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me/bookmarks", protect, getBookmarks);
router.get("/me/uploads", protect, getMyUploads);
router.put("/me", protect, updateProfile);
router.get("/:id/profile", getProfile);

module.exports = router;
