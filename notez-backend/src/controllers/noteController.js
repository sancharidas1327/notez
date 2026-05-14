const Note = require("../models/Note");
const User = require("../models/User");
const { awardXP } = require("./xpController");
const { saveUploadedFile } = require("../utils/storage");
const path = require("path");

// POST /api/notes/upload  (auth required, multipart)
const uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, description, subject, tags, college, isPremium } = req.body;
    if (!title || !subject)
      return res.status(400).json({ message: "Title and subject are required" });

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileType = ext === ".pdf" ? "pdf" : ext === ".txt" ? "text" : "image";
    const storedFile = await saveUploadedFile(req.file);

    const note = await Note.create({
      title,
      description,
      subject,
      tags: tags ? JSON.parse(tags) : [],
      college: college || req.user.college,
      fileUrl: storedFile.url,
      fileType,
      fileSize: storedFile.size,
      author: req.user._id,
      isPremium: isPremium === "true",
    });

    // Award XP for uploading
    await awardXP(req.user._id, 50, "upload_note", note._id, `Uploaded: ${title}`);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalUploads: 1 } });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notes  — browse with filters & search
const getNotes = async (req, res) => {
  try {
    const { subject, search, college, sort = "createdAt", page = 1, limit = 20 } = req.query;
    const query = { status: "active", isPublic: true };

    if (subject) query.subject = subject;
    if (college) query.college = new RegExp(college, "i");
    if (search) query.$text = { $search: search };

    const sortMap = {
      createdAt: { createdAt: -1 },
      trending: { downloads: -1, likes: -1 },
      rating: { averageRating: -1 },
    };

    const notes = await Note.find(query)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("author", "name avatar xp level");

    const total = await Note.countDocuments(query);
    res.json({ notes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notes/:id
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("author", "name avatar xp level college")
      .populate("comments.user", "name avatar");

    if (!note || note.status === "removed")
      return res.status(404).json({ message: "Note not found" });

    note.views += 1;
    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/like  (auth)
const likeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const userId = req.user._id;
    const liked = note.likes.includes(userId);

    if (liked) {
      note.likes = note.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      note.likes.push(userId);
      // Award XP to note author
      if (note.author.toString() !== userId.toString()) {
        await awardXP(note.author, 5, "note_liked", note._id, "Someone liked your note");
      }
    }

    await note.save();
    res.json({ likes: note.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/bookmark  (auth)
const bookmarkNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const userId = req.user._id;
    const saved = note.bookmarks.includes(userId);

    if (saved) {
      note.bookmarks = note.bookmarks.filter((id) => id.toString() !== userId.toString());
    } else {
      note.bookmarks.push(userId);
    }

    await note.save();
    res.json({ bookmarked: !saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/comment  (auth)
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.comments.push({ user: req.user._id, text });
    await note.save();
    await note.populate("comments.user", "name avatar");

    res.status(201).json(note.comments[note.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/rate  (auth)
const rateNote = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || value < 1 || value > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const existing = note.ratings.find((r) => r.user.toString() === req.user._id.toString());
    if (existing) {
      existing.value = value;
    } else {
      note.ratings.push({ user: req.user._id, value });
    }

    note.averageRating = note.ratings.reduce((a, r) => a + r.value, 0) / note.ratings.length;
    await note.save();

    res.json({ averageRating: note.averageRating, totalRatings: note.ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/notes/:id/download  (auth) — track download & award XP
const trackDownload = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.downloads += 1;
    await note.save();

    // Award XP to author
    if (note.author.toString() !== req.user._id.toString()) {
      await awardXP(note.author, 10, "note_downloaded", note._id, "Someone downloaded your note");
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDownloads: 1 } });

    res.json({ fileUrl: note.fileUrl, downloads: note.downloads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/notes/:id  (auth, owner only)
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.author.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    note.status = "removed";
    await note.save();
    res.json({ message: "Note removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  uploadNote,
  getNotes,
  getNoteById,
  likeNote,
  bookmarkNote,
  addComment,
  rateNote,
  trackDownload,
  deleteNote,
};
