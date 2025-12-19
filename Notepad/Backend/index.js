require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const { body, validationResult, oneOf } = require("express-validator");
const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();

// Sanitize mongoose queries to prevent injection attacks
mongoose.set("sanitizeFilter", true);

// === SECURITY & BASIC MIDDLEWARE ===
app.use(express.json());
app.use(helmet()); // 🛡️ Protects against XSS, CSP, etc.

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notepad-frontend-h386.onrender.com",
    ],
  })
);

// --- TOKEN HELPERS ---
function createAccessToken(user) {
  return jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
}
function createRefreshToken(user) {
  return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

app.get("/", (req, res) => {
  res.json({ data: "Hello Server Running ✅" });
});

// create-account
app.post(
  "/create-account",
  [
    body("fullName").trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res
          .status(400)
          .json({ error: true, message: errors.array()[0].msg });

      const { fullName, email, password } = req.body;

      const isUser = await User.findOne({ email });
      if (isUser)
        return res
          .status(409)
          .json({ error: true, message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ fullName, email, password: hashedPassword });
      await user.save();

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      return res.status(201).json({
        error: false,
        message: "Registration successful",
        accessToken,
        refreshToken,
        user: { id: user._id, fullName, email },
      });
    } catch (err) {
      console.error("❌ Create Account Error:", err);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);

// ========== LOGIN ==========
app.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res
          .status(400)
          .json({ error: true, message: errors.array()[0].msg });

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid credentials" });
      }

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      res.json({
        error: false,
        message: "Login successful",
        accessToken,
        refreshToken,
        user: { id: user._id, fullName: user.fullName, email: user.email },
      });
    } catch (err) {
      console.error("❌ Login Error:", err);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);

// get user
app.get("/get-user", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const foundUser = await User.findById(req.user._id).select("-password");
    if (!foundUser)
      return res.status(401).json({ error: true, message: "User not found" });

    res.json({
      error: false,
      user: {
        fullName: foundUser.fullName,
        email: foundUser.email,
        _id: foundUser._id,
        createdOn: foundUser.createdOn,
      },
    });
  } catch (err) {
    console.error("❌ Get User Error:", err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// add-note
app.post(
  "/add-note",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required").trim().escape(),
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .trim()
      .escape(),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }

    try {
      const { title, content, tags } = req.body;
      const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: req.user._id,
      });
      await note.save();

      res
        .status(201)
        .json({ error: false, note, message: "Note added successfully" });
    } catch (error) {
      console.error("❌ Add Note Error:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  }
);

// edit-note
app.put(
  "/edit-note/:noteId",
  authenticateToken,
  [
    oneOf([
      body("title").exists(),
      body("content").exists(),
      body("tags").exists(),
      body("isPinned").exists(),
    ]),
    body("title").optional().trim().escape(),
    body("content").optional().trim().escape(),
    body("tags").optional().isArray(),
    body("isPinned").optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: "No changes provided or invalid data" });
    }

    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;

    try {
      const note = await Note.findOne({ _id: noteId, userId: req.user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      if (req.body.title !== undefined) note.title = title;
      if (req.body.content !== undefined) note.content = content;
      if (req.body.tags !== undefined) note.tags = tags;
      if (req.body.isPinned !== undefined) note.isPinned = isPinned;

      await note.save();

      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      console.error("❌ Edit Note Error:", error);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);
// get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get All Notes Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const result = await Note.deleteOne({ _id: noteId, userId: user._id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Note not found or unauthorized" });
    }

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Note Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

app.get("/search-notes/", authenticateToken, async (req, res) => {
  const user = req.user;
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      error: true,
      message: "Search query is required",
    });
  }

  try {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(escapedQuery, "i") } },
        { content: { $regex: new RegExp(escapedQuery, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Search Notes Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(config.connectionString);
    console.log("✅ MongoDB connected successfully");
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
