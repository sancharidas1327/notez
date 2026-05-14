const express = require("express");
const router = express.Router();
const {
  uploadNote,
  getNotes,
  getNoteById,
  likeNote,
  bookmarkNote,
  addComment,
  rateNote,
  trackDownload,
  deleteNote,
} = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/upload", protect, upload.single("file"), uploadNote);
router.post("/:id/like", protect, likeNote);
router.post("/:id/bookmark", protect, bookmarkNote);
router.post("/:id/comment", protect, addComment);
router.post("/:id/rate", protect, rateNote);
router.post("/:id/download", protect, trackDownload);
router.delete("/:id", protect, deleteNote);

module.exports = router;
